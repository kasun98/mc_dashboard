'use client';

import { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import styles from './NewsCard.module.css';

export default function NewsCard({ news = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animating, setAnimating] = useState(true);

    useEffect(() => {
        if (!news || news.length === 0) return;

        const interval = setInterval(() => {
            setAnimating(false);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
                setAnimating(true);
            }, 50); // Small delay to reset animation
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [news]);

    if (!news || news.length === 0) {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <Newspaper size={24} color="var(--primary)" />
                    <h2 className={styles.title}>Latest News</h2>
                </div>
                <p className={styles.newsItem}>No news available.</p>
            </div>
        );
    }

    const currentNews = news[currentIndex];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.liveDot}></div>
                <Newspaper size={24} color="var(--primary)" />
                <h2 className={styles.title}>Latest News</h2>
            </div>
            <div className={styles.newsContainer}>
                {animating && (
                    <div className={styles.newsItem}>
                        {currentNews.title}
                        <div className={styles.date}>{currentNews.date}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
