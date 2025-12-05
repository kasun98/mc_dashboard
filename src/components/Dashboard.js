'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SummaryCard from './SummaryCard';
import PriceChart from './PriceChart';
import NewsCard from './NewsCard';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import Loading from './Loading';
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
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('Dashboard');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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

    return (
        <div className={styles.container}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className={`${styles.mainContent} ${!isSidebarOpen ? styles.mainContentCollapsed : ''}`}>
                <Header />
                <main className={styles.content}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.title}>AMFSA Price Forecast</h1>
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
                                    title="Forecast avg (10d)"
                                    value={loading ? '...' : formatCurrency(summary.forecast_10d)}
                                    change={loading ? '...' : formatPct(summary.forecast_change_pct)}
                                    trend={summary.forecast_change_pct >= 0 ? 'up' : 'down'}
                                    icon={TrendingUp}
                                    color={summary.forecast_change_pct >= 0 ? 'success' : 'danger'}
                                />

                                <SummaryCard
                                    title="Sentiment"
                                    value={loading ? '...' : summary.sentiment}
                                    change={loading ? '...' : (summary.sentiment_confidence > 0.5 ? 'Strong' : 'Neutral')}
                                    trend="neutral"
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

                    {activeTab === 'Analytics' && (
                        <div className={styles.bottomSection}>
                            <div className={styles.card} style={{ flex: 1, minWidth: '300px', borderLeft: '4px solid var(--primary)' }}>
                                <div className={styles.header}>
                                    <h2 className={styles.sectionTitle} style={{ color: 'var(--primary)' }}>Fundamental Analysis</h2>
                                </div>
                                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                    {loading ? 'Loading analysis...' : summary.fundamental_analysis || 'No analysis available.'}
                                </p>
                            </div>
                            <div className={styles.card} style={{ flex: 1, minWidth: '300px', borderLeft: '4px solid var(--success)' }}>
                                <div className={styles.header}>
                                    <h2 className={styles.sectionTitle} style={{ color: 'var(--success)' }}>Technical Analysis</h2>
                                </div>
                                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                    {loading ? 'Loading analysis...' : summary.technical_analysis || 'No analysis available.'}
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div >
    );
}
