import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET() {
    console.log("--- DEBUG START ---");
    console.log("Connecting to Tenant:", process.env.AZURE_TENANT_ID);

    // 1. Get Table Names
    const T_HIST = process.env.AMFSA_HISTORICAL_PRICE_TABLE;
    const T_V1 = process.env.ML_PREDICTION_V1_TABLE;
    const T_V2 = process.env.ML_PREDICTION_V2_TABLE;
    const T_V3 = process.env.ML_PREDICTION_V3_TABLE;
    const T_SENTIMENT = process.env.OIL_MARKET_SENTIMENT_TABLE;
    const T_ANALYSIS = process.env.TRADING_FINAL_DIRECTION_TABLE;
    const T_NEWS = process.env.OIL_NEWS_TABLE;

    // Safety Check
    if (!T_HIST) {
        return NextResponse.json({ error: "Configuration Error: Missing Table Names" }, { status: 500 });
    }

    const sqlConfig = {
        server: process.env.FABRIC_SQL_ENDPOINT,
        database: process.env.FABRIC_LAKEHOUSE_NAME,
        authentication: {
            // SWITCH TO SERVICE PRINCIPAL AUTH
            type: 'azure-active-directory-service-principal-secret',
            options: {
                clientId: process.env.AZURE_CLIENT_ID,
                clientSecret: process.env.AZURE_CLIENT_SECRET,
                tenantId: process.env.AZURE_TENANT_ID      // The Fabric Tenant ID
            }
        },
        options: {
            encrypt: true,
            trustServerCertificate: true,
            connectTimeout: 60000,
        }
    };

    try {
        const pool = await sql.connect(sqlConfig);

        // --- 2. DEFINE QUERIES (Using Env Vars) ---
        
        // Query A: The "Merge" Logic
        // We inject the table names using ${variable} syntax
        const chartQuery = `
            WITH DateRange AS (
                SELECT DISTINCT CAST(Timestamp as DATE) as date FROM ${T_HIST}
                UNION
                SELECT DISTINCT CAST(target_date as DATE) FROM ${T_V1}
                UNION
                SELECT DISTINCT CAST(target_date as DATE) FROM ${T_V2}
                UNION
                SELECT DISTINCT CAST(target_date as DATE) FROM ${T_V3}
            )
            SELECT 
                FORMAT(d.date, 'yyyy-MM-dd') as date,
                h.AMFSA00_close as price,
                v1.predicted_price as v1,
                v2.predicted_price as v2,
                v3.predicted_price as v3
            FROM DateRange d
            LEFT JOIN ${T_HIST} h ON CAST(h.Timestamp as DATE) = d.date
            LEFT JOIN ${T_V1} v1 ON CAST(v1.target_date as DATE) = d.date
            LEFT JOIN ${T_V2} v2 ON CAST(v2.target_date as DATE) = d.date
            LEFT JOIN ${T_V3} v3 ON CAST(v3.target_date as DATE) = d.date
            ORDER BY d.date ASC
        `;

        // Query B: Latest Sentiment
        const sentimentQuery = `
            SELECT TOP 1 market_sentiment, confidence 
            FROM ${T_SENTIMENT} 
            ORDER BY date DESC
        `;

        // Query C: Latest Analysis
        const analysisQuery = `
            SELECT TOP 1 fundamental_analyst, technical_analyst
            FROM ${T_ANALYSIS} 
            ORDER BY date DESC
        `;

        // Query D: Latest News (Same day only)
        const newsQuery = `
            SELECT TOP 5 FORMAT(date, 'yyyy-MM-dd') as date, title
            FROM ${T_NEWS} 
            WHERE CAST(date as DATE) = (SELECT MAX(CAST(date as DATE)) FROM ${T_NEWS})
        `;

        // --- 3. PARALLEL EXECUTION ---
        const [chartResult, sentimentResult, analysisResult, newsResult] = await Promise.all([
            pool.request().query(chartQuery),
            pool.request().query(sentimentQuery),
            pool.request().query(analysisQuery),
            pool.request().query(newsQuery)
        ]);

        const chartData = chartResult.recordset;

        // --- 4. SUMMARY CALCULATIONS ---
        const summary = {};

        // A. Price Calculation
        const historyRows = chartData.filter(r => r.price != null);
        
        if (historyRows.length > 0) {
            const latest = historyRows[historyRows.length - 1];
            summary.current_price = latest.price;
            summary.current_date = latest.date;

            if (historyRows.length >= 2) {
                const prev = historyRows[historyRows.length - 2];
                summary.price_change_pct = ((latest.price - prev.price) / prev.price) * 100;
            } else {
                summary.price_change_pct = 0.0;
            }
        } else {
            summary.current_price = 0.0;
            summary.price_change_pct = 0.0;
        }

        // B. Forecast Calculation
        const lastRow = chartData[chartData.length - 1];
        let forecasts = [];
        if (lastRow.v1) forecasts.push(lastRow.v1);
        if (lastRow.v2) forecasts.push(lastRow.v2);
        if (lastRow.v3) forecasts.push(lastRow.v3);

        if (forecasts.length > 0) {
            const avgForecast = forecasts.reduce((a, b) => a + b, 0) / forecasts.length;
            summary.forecast_10d = avgForecast;
            
            if (summary.current_price !== 0) {
                summary.forecast_change_pct = ((avgForecast - summary.current_price) / summary.current_price) * 100;
            } else {
                summary.forecast_change_pct = 0.0;
            }
        } else {
            summary.forecast_10d = 0.0;
            summary.forecast_change_pct = 0.0;
        }

        // C. Sentiment & Analysis
        const sent = sentimentResult.recordset[0] || {};
        summary.sentiment = sent.market_sentiment || "Neutral";
        summary.sentiment_confidence = sent.confidence || 0.0;

        const anal = analysisResult.recordset[0] || {};
        summary.fundamental_analysis = anal.fundamental_analyst || "No data";
        summary.technical_analysis = anal.technical_analyst || "No data";

        // --- 5. FINAL RESPONSE ---
        return NextResponse.json({
            chart_data: chartData,
            summary: summary,
            news: newsResult.recordset
        });

    } catch (err) {
        console.error('SQL Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}