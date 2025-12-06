import { NextResponse } from 'next/server';

// This route now acts as a Middleware/Proxy to your separate backend.
export async function GET() {
    console.log("--- DEBUG START: API PROXY ---");

    // 1. The URL of your future separate backend (e.g., Python/FastAPI deployed on Azure Container Apps or Render)
    // Set this in your .env file: DATA_BACKEND_URL=https://my-python-api.com/get-dashboard-data
    const BACKEND_URL = process.env.DATA_BACKEND_URL || 'http://localhost:8000/api/data'; 

    try {
        console.log(`Attempting to fetch from backend: ${BACKEND_URL}`);

        // --- OPTION A: REAL FETCH (Uncomment when backend is ready) ---
        /*
        const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add API Keys here if needed: 'X-API-KEY': process.env.BACKEND_API_KEY
            },
            next: { revalidate: 300 } // Cache for 5 minutes (optional)
        });

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
        */

        // --- OPTION B: DUMMY/MOCK DATA (Active now for testing) ---
        // This simulates exactly what your Python backend SHOULD return
        // so your Frontend continues to work without errors.
        console.warn("Backend not reachable or disabled. Returning MOCK DATA.");
        
        const mockData = generateMockData();
        
        // Simulate network delay (optional)
        await new Promise(resolve => setTimeout(resolve, 500)); 

        return NextResponse.json(mockData);

    } catch (err) {
        console.error('Proxy Error:', err);
        // Even on error, we can return the mock data to keep the dashboard alive
        // or return a 500 error if you prefer strict failure.
        return NextResponse.json({ error: "Failed to fetch data from backend service." }, { status: 500 });
    }
}

// --- HELPER: MOCK DATA GENERATOR ---
// This matches the exact schema your SQL query was producing.
function generateMockData() {
    // 1. Mock Chart Data (Historical + Forecast)
    const chartData = [];
    const today = new Date();
    
    // Generate 30 days of history
    for (let i = 30; i > 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        chartData.push({
            date: d.toISOString().split('T')[0],
            price: 70 + Math.random() * 5, // Random price between 70-75
            v1: null, v2: null, v3: null
        });
    }

    // Generate 10 days of forecast
    let lastPrice = chartData[chartData.length - 1].price;
    for (let i = 1; i <= 10; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        chartData.push({
            date: d.toISOString().split('T')[0],
            price: null,
            v1: lastPrice + (Math.random() * 2 - 1), // Random fluctuation
            v2: lastPrice + (Math.random() * 2 - 1) + 0.5,
            v3: lastPrice + (Math.random() * 2 - 1) - 0.5
        });
        lastPrice = chartData[chartData.length - 1].v1; // Trend follow
    }

    // 2. Mock Summary
    const summary = {
        current_price: 74.50,
        current_date: today.toISOString().split('T')[0],
        price_change_pct: 1.25, // +1.25%
        forecast_10d: 76.00,
        forecast_change_pct: 2.01,
        sentiment: "Bullish",
        sentiment_confidence: 0.85,
        fundamental_analysis: "Supply constraints expected to push prices up.",
        technical_analysis: "Golden cross detected on 4H chart."
    };

    // 3. Mock News
    const news = [
        { date: today.toISOString().split('T')[0], title: "OPEC+ Announces Surprise Production Cut" },
        { date: today.toISOString().split('T')[0], title: "US Crude Inventories Drop Unexpectedly" },
        { date: today.toISOString().split('T')[0], title: "Global Demand Forecast Revised Upwards" },
        { date: today.toISOString().split('T')[0], title: "Geopolitical Tensions Rise in Middle East" },
        { date: today.toISOString().split('T')[0], title: "New Green Energy Regulations Impact Oil Majors" }
    ];

    return {
        chart_data: chartData,
        summary: summary,
        news: news
    };
}