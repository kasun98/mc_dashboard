import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET() {

    const sqlConfig = {
        server: process.env.FABRIC_SQL_ENDPOINT,
        database: process.env.FABRIC_LAKEHOUSE_NAME,
        authentication: {
            type: 'azure-active-directory-default'
        },
        options: {
            encrypt: true,
            trustServerCertificate: true, // Crucial for Azure internal networks
            connectTimeout: 30000,        // 30 seconds timeout
        }
    };

    try {
        const pool = await sql.connect(sqlConfig);

        // --- 1. DEFINE QUERIES ---
        
        // Query A: The "Merge" Logic (Chart Data + Historical Summary)
        const chartQuery = `
            WITH DateRange AS (
                SELECT DISTINCT CAST(Timestamp as DATE) as date FROM AMFSA_HISTORICAL_PRICE_TABLE
                UNION
                SELECT DISTINCT CAST(target_date as DATE) FROM ML_PREDICTION_V1_TABLE
                UNION
                SELECT DISTINCT CAST(target_date as DATE) FROM ML_PREDICTION_V2_TABLE
                UNION
                SELECT DISTINCT CAST(target_date as DATE) FROM ML_PREDICTION_V3_TABLE
            )
            SELECT 
                FORMAT(d.date, 'yyyy-MM-dd') as date,
                h.AMFSA00_close as price,
                v1.predicted_price as v1,
                v2.predicted_price as v2,
                v3.predicted_price as v3
            FROM DateRange d
            LEFT JOIN AMFSA_HISTORICAL_PRICE_TABLE h ON CAST(h.Timestamp as DATE) = d.date
            LEFT JOIN ML_PREDICTION_V1_TABLE v1 ON CAST(v1.target_date as DATE) = d.date
            LEFT JOIN ML_PREDICTION_V2_TABLE v2 ON CAST(v2.target_date as DATE) = d.date
            LEFT JOIN ML_PREDICTION_V3_TABLE v3 ON CAST(v3.target_date as DATE) = d.date
            ORDER BY d.date ASC
        `;

        // Query B: Latest Sentiment
        const sentimentQuery = `
            SELECT TOP 1 market_sentiment, confidence 
            FROM OIL_MARKET_SENTIMENT_TABLE 
            ORDER BY date DESC
        `;

        // Query C: Latest Analysis
        const analysisQuery = `
            SELECT TOP 1 fundamental_analyst, technical_analyst
            FROM TRADING_FINAL_DIRECTION_TABLE
            ORDER BY date DESC
        `;

        // Query D: Latest News (Same day only)
        const newsQuery = `
            SELECT TOP 5 FORMAT(date, 'yyyy-MM-dd') as date, title
            FROM OIL_NEWS_TABLE
            WHERE CAST(date as DATE) = (SELECT MAX(CAST(date as DATE)) FROM OIL_NEWS_TABLE)
        `;

        // --- 2. PARALLEL EXECUTION ---
        const [chartResult, sentimentResult, analysisResult, newsResult] = await Promise.all([
            pool.request().query(chartQuery),
            pool.request().query(sentimentQuery),
            pool.request().query(analysisQuery),
            pool.request().query(newsQuery)
        ]);

        const chartData = chartResult.recordset;

        // --- 3. SUMMARY CALCULATIONS ---
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

        // --- 4. FINAL RESPONSE ---
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