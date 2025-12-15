import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import styles from './TickerTile.module.css';

const TickerTile = ({ data, loading }) => {
    if (loading || !data || !data.latest_stats) {
        return (
            <div className={styles.tickerContainer}>
                <div className={styles.label}>Loading Market Data...</div>
            </div>
        );
    }

    const stats = data.latest_stats;

    // Helper to format values
    const formatNum = (num, decimals = 2) => {
        if (num === null || num === undefined) return 'N/A';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatPct = (num) => {
        if (num === null || num === undefined) return 'N/A';
        const sign = num > 0 ? '+' : '';
        return `${sign}${num.toFixed(2)}%`;
    };

    const getTrendIcon = (val) => {
        if (val > 0) return <ArrowUpRight size={16} />;
        if (val < 0) return <ArrowDownRight size={16} />;
        return <Minus size={16} />;
    };

    const getTrendClass = (val) => {
        if (val > 0) return styles.positive;
        if (val < 0) return styles.negative;
        return styles.neutral;
    };

    // Calculate RSI/Oscillator Status
    // Assuming ro_range_osc is roughly -100 to 100 or similar.
    // User description: "percentage deviation... breakUp > 100, breakDn < -100"
    // Usually RSI is 0-100. Range Osc is different.
    // Lets display the value and a clear interpretation.
    const roVal = stats.ro_range_osc;
    let roStatus = 'Neutral';
    let roClass = styles.neutral;
    if (roVal > 100) { roStatus = 'Overbought'; roClass = styles.statusBearish; } // Potential reversal
    else if (roVal < -100) { roStatus = 'Oversold'; roClass = styles.statusBullish; } // Potential reversal

    // STS (Bollinger/Theil-Sen) Status using %B
    // 0.5 = middle, >1 = above upper, <0 = below lower
    const bPct = stats.sts_feat_b_percent;
    let bStatus = 'Inside Bands';
    let bClass = styles.neutral;
    if (bPct > 1) { bStatus = 'Upper Breakout'; bClass = styles.statusBullish; }
    else if (bPct < 0) { bStatus = 'Lower Breakout'; bClass = styles.statusBearish; }

    // Supertrend
    const supertrendSignal = stats.s_signal; // 1 = Buy, 0 = Sell
    const stStatus = supertrendSignal === 1 ? 'BUY' : 'SELL';
    const stClass = supertrendSignal === 1 ? styles.statusBullish : styles.statusBearish;

    // Momentum
    const momVal = stats.sm_squeeze_momentum;
    const momPhase = stats.sm_momentum_phase; // 2 strong bull, 1 weak bull, -1 weak bear, -2 strong bear
    let momStatus = 'Neutral';
    let momClass = styles.neutral;
    if (momPhase === 2) { momStatus = 'Strong Bull'; momClass = styles.statusBullish; }
    else if (momPhase === 1) { momStatus = 'Weak Bull'; momClass = styles.sectionTitle; } // Reuse or custom
    else if (momPhase === -1) { momStatus = 'Weak Bear'; momClass = styles.neutral; }
    else if (momPhase === -2) { momStatus = 'Strong Bear'; momClass = styles.statusBearish; }


    return (
        <div className={styles.wrapper}>
            <div className={styles.tickerHeader}>
                <h3 className={styles.title}>Crude Oil WTI</h3>
            </div>
            <div className={styles.tickerContainer}>
                {/* Price section already covered in main cards, but good for context */}
                <div className={styles.tickerItem}>
                    <div className={styles.label}>Price</div>
                    <div className={styles.valueRow}>
                        <span className={styles.value}>{formatNum(stats.Close || data.current_price)}</span>
                        <span className={`${styles.change} ${getTrendClass(stats.price_change_pct ?? data.price_change_pct)}`}>
                            {getTrendIcon(stats.price_change_pct ?? data.price_change_pct)}
                            {formatPct(stats.price_change_pct ?? data.price_change_pct)}
                        </span>
                    </div>
                </div>

                <div className={styles.separator} />

                <div className={styles.tickerItem}>
                    <div className={styles.label}>Volume</div>
                    <div className={styles.valueRow}>
                        <span className={styles.value}>{formatNum(stats.Volume, 0)}</span>
                        <span className={`${styles.change} ${getTrendClass(data.volume_change_pct)}`}>
                            {getTrendIcon(data.volume_change_pct)}
                            {formatPct(data.volume_change_pct)}
                        </span>
                    </div>
                </div>

                <div className={styles.separator} />

                <div className={styles.tickerItem}>
                    <div className={styles.label}>Range Osc</div>
                    <div className={styles.valueRow}>
                        <span className={styles.value}>{formatNum(roVal)}</span>
                        <span className={`${styles.indicatorStatus} ${roClass}`}>{roStatus}</span>
                    </div>
                </div>

                <div className={styles.separator} />

                <div className={styles.tickerItem}>
                    <div className={styles.label}>Theil-Sen Bands (%B)</div>
                    <div className={styles.valueRow}>
                        <span className={styles.value}>{formatNum(bPct)}</span>
                        <span className={`${styles.indicatorStatus} ${bClass}`}>{bStatus}</span>
                    </div>
                </div>

                <div className={styles.separator} />

                <div className={styles.tickerItem}>
                    <div className={styles.label}>Supertrend</div>
                    <div className={styles.valueRow}>
                        <span className={`${styles.indicatorStatus} ${stClass}`}>{stStatus}</span>
                    </div>
                </div>

                <div className={styles.separator} />

                <div className={styles.tickerItem}>
                    <div className={styles.label}>Squeeze Mom.</div>
                    <div className={styles.valueRow}>
                        <span className={styles.value}>{formatNum(momVal)}</span>
                        <span className={`${styles.indicatorStatus} ${momClass}`}>{momStatus}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TickerTile;
