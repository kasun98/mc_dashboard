'use client';

import { useState, useEffect, useRef } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import styles from './PriceChart.module.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                {payload.map((entry, index) => {
                    if (entry.value === null || entry.value === undefined) return null;
                    const formattedValue = typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value;
                    return (
                        <p key={index} style={{ color: entry.color }} className={styles.tooltipItem}>
                            {entry.name}: {formattedValue}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

export default function PriceChart({ data: rawData, loading, error }) {
    const [fullData, setFullData] = useState([]);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
    const [timeRange, setTimeRange] = useState('3M'); // Default to 3M
    const chartRef = useRef(null);

    useEffect(() => {
        if (rawData && rawData.length > 0) {
            const result = JSON.parse(JSON.stringify(rawData));
            let lastHistoricalIndex = -1;
            for (let i = 0; i < result.length; i++) {
                if (result[i].price !== null && result[i].price !== undefined) {
                    lastHistoricalIndex = i;
                }
            }

            if (lastHistoricalIndex !== -1 && lastHistoricalIndex < result.length - 1) {
                const lastPrice = result[lastHistoricalIndex].price;
                result[lastHistoricalIndex].v1 = lastPrice;
                result[lastHistoricalIndex].v2 = lastPrice;
                result[lastHistoricalIndex].v3 = lastPrice;
            }

            setFullData(result);
            handleRangeChange('3M', result);
        }
    }, [rawData]);

    useEffect(() => {
        const container = chartRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            e.preventDefault();
            if (fullData.length === 0) return;

            const currentLength = visibleRange.end - visibleRange.start;
            const zoomFactor = 0.1;
            const delta = Math.floor(currentLength * zoomFactor * Math.sign(e.deltaY));

            let newStart = visibleRange.start - delta;
            let newEnd = visibleRange.end + delta;

            // Minimum zoom level (e.g., 10 points)
            if (newEnd - newStart < 10) return;

            // Clamp to bounds
            if (newStart < 0) newStart = 0;
            if (newEnd > fullData.length) newEnd = fullData.length;

            setVisibleRange({ start: Math.round(newStart), end: Math.round(newEnd) });
            setTimeRange('CUSTOM'); // Switch to custom when zooming
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [fullData, visibleRange]);

    const handleRangeChange = (range, data = fullData) => {
        if (data.length === 0) return;

        let days = 90;
        if (range === '1M') days = 30;
        if (range === '3M') days = 90;
        if (range === '1Y') days = 365;
        if (range === 'ALL') days = data.length;

        const start = Math.max(0, data.length - days);
        setVisibleRange({ start, end: data.length });
        setTimeRange(range);
    };

    const visibleData = fullData.slice(visibleRange.start, visibleRange.end);

    if (loading) return <div className={styles.loading}>Loading data...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.wrapper} ref={chartRef}>
            <div className={styles.controls}>
                <div className={styles.rangeSelector}>
                    {['1M', '3M', '1Y', 'ALL'].map((range) => (
                        <button
                            key={range}
                            className={`${styles.rangeBtn} ${timeRange === range ? styles.activeRange : ''}`}
                            onClick={() => handleRangeChange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={visibleData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorV1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorV2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorV3" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
                            }}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="price"
                            name="Price"
                            stroke="#8b5cf6"
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={3}
                            connectNulls
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="v1"
                            name="Forecast V1"
                            stroke="#0ea5e9"
                            fillOpacity={1}
                            fill="url(#colorV1)"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            connectNulls
                        />
                        <Area
                            type="monotone"
                            dataKey="v2"
                            name="Forecast V2"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorV2)"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            connectNulls
                        />
                        <Area
                            type="monotone"
                            dataKey="v3"
                            name="Forecast V3"
                            stroke="#f59e0b"
                            fillOpacity={1}
                            fill="url(#colorV3)"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            connectNulls
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
