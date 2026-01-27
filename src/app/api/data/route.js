import { NextResponse } from 'next/server';

export async function GET() {
    console.log("--- DEBUG START: API PROXY ---");
    const BACKEND_URL = process.env.DATA_BACKEND_URL; 

    // 1. Setup Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 360000); 

    try {
        console.log(`Attempting to fetch from backend...`);
        const startTime = Date.now();

        // 2. FETCH (Clean URL)
        const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal, 
            next: { revalidate: 3600 } // Cache for 60 minutes
        });

        const duration = Date.now() - startTime;
        console.log(`Azure Response received in ${duration}ms. Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (err) {
        console.error('Proxy Error:', err);
        
        if (err.name === 'AbortError') {
             return NextResponse.json(
                { error: "Backend timeout (Cold Start). Please refresh." }, 
                { status: 504 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch data.", details: err.message }, 
            { status: 500 }
        );
    } finally {
        // 3. ALWAYS clear the timer
        // This runs whether the request succeeds in 1ms or fails.
        // It ensures we don't leave a timer running in the background.
        clearTimeout(timeoutId);
    }
}