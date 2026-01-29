'use client';

import { useState, useMemo } from 'react';
import {
    ComposedChart,
    Line,
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
                <p className={styles.tooltipLabel}>
                    {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
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

export default function NextDayPredictionChart({ predictions = {}, description }) {
    const [selectedModel, setSelectedModel] = useState('v1');

    // Get the data array for the selected model
    const currentData = predictions[selectedModel] || [];

    // Filter and sort the data: Next Day means prediction_run_date === target_date
    const chartData = useMemo(() => {
        if (!currentData || currentData.length === 0) return [];

        return currentData
            .filter(item => item.prediction_run_date === item.target_date)
            .sort((a, b) => new Date(a.target_date) - new Date(b.target_date));
    }, [currentData]);

    const getModelDetails = (model) => {
        switch (model) {
            case 'v1': return { title: 'V1', color: '#0ea5e9' };
            case 'v2': return { title: 'V2', color: '#10b981' };
            case 'v3': return { title: 'V3', color: '#f59e0b' };
            default: return { title: 'Unknown', color: '#8b5cf6' };
        }
    };

    const { color } = getModelDetails(selectedModel);

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>Next Day Prediction Accuracy ({selectedModel.toUpperCase()})</h3>
                    {description && <p className={styles.description}>{description}</p>}
                </div>
                <div className={styles.controls}>
                    <select
                        className={styles.dateSelect}
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                    >
                        <option value="v1">Model V1</option>
                        <option value="v2">Model V2</option>
                        <option value="v3">Model V3</option>
                    </select>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className={styles.noData}>No data available for this model selection</div>
            ) : (
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
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
            )}
        </div>
    );
}
