export const getHistoricalPrices = () => {
    const data = [];
    const startDate = new Date('2025-01-01');
    let price = 70;

    for (let i = 0; i < 90; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        // Random walk
        price = price + (Math.random() - 0.5) * 2;

        data.push({
            date: date.toISOString().split('T')[0],
            price: Number(price.toFixed(2))
        });
    }
    return data;
};

export const getForecasts = (startDateStr) => {
    const data = [];
    const startDate = new Date(startDateStr);
    let v1 = 75;
    let v2 = 75;
    let v3 = 75;

    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        v1 = v1 + (Math.random() - 0.4) * 2; // Slightly bullish
        v2 = v2 + (Math.random() - 0.6) * 2; // Slightly bearish
        v3 = v3 + (Math.random() - 0.5) * 3; // Volatile

        data.push({
            date: date.toISOString().split('T')[0],
            v1: Number(v1.toFixed(2)),
            v2: Number(v2.toFixed(2)),
            v3: Number(v3.toFixed(2))
        });
    }
    return data;
};

export const getChartData = () => {
    const historical = getHistoricalPrices();
    const lastDate = historical[historical.length - 1].date;
    const forecasts = getForecasts(lastDate);

    // Combine data
    // For the chart, we want a continuous timeline
    // Historical points have 'price', forecasts have 'v1', 'v2', 'v3'

    const combined = [
        ...historical.map(h => ({ ...h, v1: null, v2: null, v3: null })),
        ...forecasts.map(f => ({ date: f.date, price: null, ...f }))
    ];

    return combined;
};
