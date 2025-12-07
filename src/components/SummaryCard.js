'use client';

import styles from './SummaryCard.module.css';

export default function SummaryCard({ title, value, change, trend, icon: Icon, color }) {
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div
            className={`${styles.card} ${trend === 'up' ? styles.trendUp : styles.trendDown}`}
            onMouseMove={handleMouseMove}
        >
            <div className={styles.spotlight} />
            <div className={styles.header}>
                <div className={`${styles.iconWrapper} ${styles[color]}`}>
                    {Icon && <Icon size={24} />}
                </div>
                <span className={`${styles.change} ${trend === 'up' ? styles.up : styles.down}`}>
                    {change}
                </span>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.value}>{value}</div>
            </div>
        </div>
    );
}
