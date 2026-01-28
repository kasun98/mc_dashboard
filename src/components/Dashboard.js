'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SummaryCard from './SummaryCard';
import PriceChart from './PriceChart';
import NewsCard from './NewsCard';
import AnalysisCard from './AnalysisCard';
import TickerTile from './TickerTile';
import TradingViewWidget from './TradingViewWidget';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import Loading from './Loading';
import PredictionChart from './PredictionChart';
import NextDayPredictionChart from './NextDayPredictionChart';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const [chartData, setChartData] = useState([]);
    const [summary, setSummary] = useState({
        current_price: 0,
        current_date: '',
        price_change_pct: 0,
        forecast_10d: 0,
        forecast_change_pct: 0,
        sentiment: 'Neutral',
        sentiment_confidence: 0,
        fundamental_analysis: '',
        technical_analysis: ''
    });
    const [predictions, setPredictions] = useState({
        v1: [],
        v2: [],
        v3: []
    });
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('Dashboard');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
            // Don't auto-open on desktop to respect user preference if they closed it
            // ensuring initial load on desktop is open is handled by default state (true) 
            // but we might want to check initial load specifically.
        };

        // Check initial load
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/data');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch data');
                }
                const result = await response.json();

                if (result.chart_data) {
                    setChartData(result.chart_data);
                }
                if (result.summary) {
                    setSummary(result.summary);
                }
                if (result.news) {
                    setNews(result.news);
                }
                if (result.past_predictions_v1) {
                    setPredictions({
                        v1: result.past_predictions_v1,
                        v2: result.past_predictions_v2 || [],
                        v3: result.past_predictions_v3 || []
                    });
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const formatPct = (val) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${val.toFixed(1)}%`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getSentimentUI = (sentiment) => {
        const s = sentiment ? sentiment.toLowerCase() : '';
        if (s.includes('bullish')) {
            return { icon: TrendingUp, color: 'success' };
        } else if (s.includes('bearish')) {
            return { icon: TrendingDown, color: 'danger' };
            return { icon: TrendingDown, color: 'info' };
        }
    };

    const sentimentUI = getSentimentUI(summary.sentiment);

    if (loading) {
        return <Loading />;
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning !';
        if (hour < 18) return 'Good Afternoon !';
        return 'Good Evening !';
    };

    return (
        <div className={styles.container}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className={`${styles.mainContent} ${!isSidebarOpen ? styles.mainContentCollapsed : ''}`}>
                <Header toggleSidebar={toggleSidebar} />
                <main className={styles.content}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.title}>
                            {activeTab === 'Dashboard' ? getGreeting() : activeTab === 'Predictions' ? 'Previous Forecast' : 'AMFSA Price Forecast'}
                        </h1>
                        <div className={styles.date}>
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    {activeTab === 'Dashboard' && (
                        <>
                            <div style={{ flex: 1, minWidth: '300px', marginBottom: '1.5rem' }}>
                                <NewsCard news={news} />
                            </div>

                            <div className={styles.grid}>
                                <SummaryCard
                                    title="Current Price"
                                    value={loading ? '...' : formatCurrency(summary.current_price)}
                                    change={loading ? '...' : formatPct(summary.price_change_pct)}
                                    trend={summary.price_change_pct >= 0 ? 'up' : 'down'}
                                    icon={DollarSign}
                                    color={summary.price_change_pct >= 0 ? 'success' : 'danger'}
                                />
                                <SummaryCard
                                    title="Next Day Price Avg"
                                    value={loading ? '...' : formatCurrency(summary.forecast_next_day)}
                                    change={loading ? '...' : formatPct(summary.forecast_change_pct)}
                                    trend={summary.forecast_change_pct >= 0 ? 'up' : 'down'}
                                    icon={TrendingUp}
                                    color={summary.forecast_change_pct >= 0 ? 'success' : 'danger'}
                                />

                                <SummaryCard
                                    title="Sentiment"
                                    value={loading ? '...' : summary.sentiment}
                                    change={loading ? '...' : (summary.sentiment_confidence > 0.5 ? 'Strong' : 'Neutral')}
                                    trend={summary.sentiment?.toLowerCase().includes('bullish') ? 'up' : 'down'}
                                    icon={sentimentUI.icon}
                                    color={sentimentUI.color}
                                />
                            </div>

                            <div className={styles.chartSection}>
                                <div className={styles.chartHeader}>
                                    <h2 className={styles.sectionTitle}>Price History & Forecast</h2>
                                    <div className={styles.actions}>
                                        {/* Actions removed as per user request */}
                                    </div>
                                </div>
                                <PriceChart data={chartData} loading={loading} error={error} />
                            </div>
                        </>
                    )}

                    {activeTab === 'Predictions' && (
                        <div className={styles.grid}>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <NextDayPredictionChart predictions={predictions} />
                                <PredictionChart
                                    data={predictions.v1}
                                    title="Prediction Model (10-day) V1"
                                    color="#0ea5e9"
                                />
                                <PredictionChart
                                    data={predictions.v2}
                                    title="Prediction Model (10-day) V2"
                                    color="#10b981"
                                />
                                <PredictionChart
                                    data={predictions.v3}
                                    title="Prediction Model (10-day) V3"
                                    color="#f59e0b"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'Analytics' && (
                        <>
                            <TradingViewWidget />
                            <TickerTile data={summary} loading={loading} />
                            <div className={styles.bottomSection}>
                                <AnalysisCard
                                    title="Fundamental Analysis"
                                    content={loading ? 'Loading analysis...' : summary.fundamental_analysis || 'No analysis available.'}
                                    variant="primary"
                                />
                                <AnalysisCard
                                    title="Technical Analysis"
                                    content={loading ? 'Loading analysis...' : summary.technical_analysis || 'No analysis available.'}
                                    variant="success"
                                />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div >
    );
}
