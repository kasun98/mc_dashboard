'use client';

import { LayoutDashboard, BarChart3, PieChart, Settings, User, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: BarChart3, label: 'Analytics', active: false },
    // { icon: PieChart, label: 'Portfolio', active: false },
    // { icon: Settings, label: 'Settings', active: false },
];

export default function Sidebar({ isOpen, toggleSidebar, activeTab, onTabChange }) {
    return (
        <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}></div>
                    <span className={`${styles.logoText} ${!isOpen ? styles.hidden : ''}`}>OilForecast</span>
                </div>
                <button className={styles.toggleBtn} onClick={toggleSidebar}>
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <a
                        key={item.label}
                        href="#"
                        className={`${styles.navItem} ${activeTab === item.label ? styles.active : ''}`}
                        title={!isOpen ? item.label : ''}
                        onClick={(e) => {
                            e.preventDefault();
                            onTabChange(item.label);
                        }}
                    >
                        <item.icon size={20} />
                        <span className={!isOpen ? styles.hidden : ''}>{item.label}</span>
                    </a>
                ))}
            </nav>

            <div className={styles.bottomNav}>
                <a href="#" className={styles.navItem} title={!isOpen ? 'Profile' : ''}>
                    <User size={20} />
                    <span className={!isOpen ? styles.hidden : ''}>Profile</span>
                </a>
            </div>
        </aside>
    );
}
