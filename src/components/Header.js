'use client';

import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import styles from './Header.module.css';

export default function Header({ toggleSidebar }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Init based on system or previous preference
        if (typeof window !== 'undefined') {
            const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(isSystemDark);

            if (isSystemDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.add('light');
            }
        }
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);

        const html = document.documentElement;
        if (newDark) {
            html.classList.remove('light');
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
            html.classList.add('light');
        }
    };

    return (
        <header className={styles.header}>
            <button className={styles.mobileMenuBtn} onClick={toggleSidebar}>
                <Menu size={20} />
            </button>
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
