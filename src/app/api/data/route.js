import { NextResponse } from 'next/server';

// This route now acts as a Middleware/Proxy to your separate backend.
export async function GET() {
    console.log("--- DEBUG START: API PROXY ---");

    const BACKEND_URL = process.env.DATA_BACKEND_URL; 

    try {
        console.log(`Attempting to fetch from backend: ${BACKEND_URL}`);

        const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 1800 } // Cache for 30 minutes
        });

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (err) {
        console.error('Proxy Error:', err);
        // Even on error, we can return the mock data to keep the dashboard alive
        // or return a 500 error if you prefer strict failure.
        return NextResponse.json({ error: "Failed to fetch data from backend service." }, { status: 500 });
    }
}
