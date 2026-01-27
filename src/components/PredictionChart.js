'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import styles from './PredictionChart.module.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                {payload.map((entry, index) => {
                    const formattedValue = typeof entry.value === 'number'
                        ? `$${entry.value.toFixed(2)}`
                        : entry.value;
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

export default function PredictionChart({ data = [], title, color = '#8b5cf6' }) {
    // Extract unique run dates for the filter
    const runDates = useMemo(() => {
        if (!data || data.length === 0) return [];
        const dates = [...new Set(data.map(item => item.prediction_run_date))];
        return dates.sort((a, b) => new Date(b) - new Date(a)); // Newest first
    }, [data]);

    const [selectedDate, setSelectedDate] = useState('');

    // Set initial selected date
    useEffect(() => {
        if (runDates.length > 0 && !selectedDate) {
            setSelectedDate(runDates[0]);
        }
    }, [runDates, selectedDate]);

    // Filter data based on selection
    const chartData = useMemo(() => {
        if (!selectedDate) return [];
        return data.filter(item => item.prediction_run_date === selectedDate)
            .sort((a, b) => new Date(a.target_date) - new Date(b.target_date));
    }, [data, selectedDate]);

    if (!data || data.length === 0) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                </div>
                <div className={styles.noData}>No data available</div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.controls}>
                    <select
                        className={styles.dateSelect}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    >
                        {runDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={`color${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="target_date"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
                            }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="AMFSA00_close"
                            name="Actual Price"
                            stroke="var(--text-primary)"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="predicted_price"
                            name="Predicted Price"
                            stroke={color}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
