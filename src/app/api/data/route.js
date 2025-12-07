import { NextResponse } from 'next/server';

export async function GET() {
    console.log("--- DEBUG START: API PROXY ---");
    const BACKEND_URL = process.env.DATA_BACKEND_URL; 

    // 1. Create a Timeout Controller (Set to 60 seconds)
    // This forces the Node.js server to wait up to 60s for Python to wake up
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); 

    try {
        console.log(`Attempting to fetch from backend...`);
        const startTime = Date.now();

        // 2. Add a timestamp to the URL to prevent aggressive intermediate caching
        // Note: We assume BACKEND_URL already has '?code=...'
        // We append '&t=...' to it.
        const cacheBusterUrl = `${BACKEND_URL}&t=${Date.now()}`;

        const response = await fetch(cacheBusterUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // 3. Attach the signal so we control the timeout
            signal: controller.signal, 
            // 4. "no-store" is often safer for dynamic dashboards than "revalidate" 
            // if you are already handling caching in Python or Fabric.
            // But if you prefer 30m cache, keep "revalidate: 1800"
            next: { revalidate: 1800 } 
        });

        // Clear the timeout timer since we got a response
        clearTimeout(timeoutId);

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
        
        // Handle Timeout specifically
        if (err.name === 'AbortError') {
             return NextResponse.json(
                { error: "The backend took too long to wake up (Cold Start). Please refresh in 10 seconds." }, 
                { status: 504 }
            );
        }

        return NextResponse.json(
            { error: "Failed to fetch data.", details: err.message }, 
            { status: 500 }
        );
    }
}