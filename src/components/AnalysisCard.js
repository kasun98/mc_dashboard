'use client';

import styles from './AnalysisCard.module.css';

export default function AnalysisCard({ title, content, variant = 'primary' }) {
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
            className={`${styles.card} ${styles[variant]}`}
            onMouseMove={handleMouseMove}
        >
            <div className={styles.spotlight} />
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
            </div>
            <p className={styles.content}>
                {content}
            </p>
        </div>
    );
}
