'use client';

import styles from './SummaryCard.module.css';

export default function SummaryCard({ title, value, change, trend, icon: Icon, color }) {
    return (
        <div className={styles.card}>
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
