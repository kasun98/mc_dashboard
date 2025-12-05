'use client';

import { useState, useEffect } from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Default to light mode, do nothing
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className={styles.header}>
            <div className={styles.actions}>
                <button className={styles.iconBtn} onClick={toggleTheme}>
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className={styles.iconBtn}>
                    <Bell size={20} />
                    <span className={styles.badge}></span>
                </button>
                <div className={styles.profile}>
                    <div className={styles.avatar}>U</div>
                    <span className={styles.name}>User</span>
                </div>
            </div>
        </header>
    );
}
