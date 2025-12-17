'use client';
import React, { useEffect, useRef, memo, useState } from 'react';
import styles from './TradingViewWidget.module.css';

function TradingViewWidget() {
    const containerId = useRef(`tradingview_${Math.random().toString(36).substring(7)}`);
    const [theme, setTheme] = useState('dark');
    const widgetRef = useRef(null);

    // 1. EXACT Color match for your tile
    const WIDGET_BG_COLOR = "#151A25"; 

    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };
        checkTheme();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkTheme();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let script = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');

        const initWidget = () => {
            if (typeof TradingView !== 'undefined' && containerId.current) {
                const isDark = theme === 'dark';
                const activeColor = isDark ? WIDGET_BG_COLOR : "#ffffff";

                const widgetConfig = {
                    "autosize": true,
                    "symbol": "CFI:WTI",
                    "interval": "1",
                    "timezone": "Asia/Colombo",
                    "theme": theme,
                    "style": "2",
                    "locale": "en",
                    
                    // 2. Toolbar Background: This handles the top bar color
                    "toolbar_bg": activeColor,
                    
                    "enable_publishing": false,
                    "allow_symbol_change": false,
                    "container_id": containerId.current,
                    "hide_side_toolbar": true,
                    "hide_top_toolbar": false,
                    "hide_legend": false,
                    "hide_volume": true,
                    "details": false,
                    "calendar": false,
                    "hotlist": false,
                    "save_image": false, // Disable saving to prevent cached style issues

                    "backgroundColor": activeColor,
                    
                    // 3. OVERRIDES: This forces the internal chart parts to match the background
                    "overrides": {
                        "paneProperties.background": activeColor,
                        "paneProperties.backgroundType": "solid",
                        
                        // Hide internal grid lines
                        "paneProperties.vertGridProperties.color": activeColor,
                        "paneProperties.horzGridProperties.color": activeColor,
                        
                        // Hides the Left and Bottom Axis lines (The white borders)
                        "scalesProperties.lineColor": activeColor,
                        "scalesProperties.textColor": "#999999",
                    },

                    // 4. Loading Screen: Hides the black flash on load
                    "loading_screen": { 
                        "backgroundColor": activeColor,
                        "foregroundColor": "#2962FF" 
                    },

                    "studies": [],
                    "show_popup_button": true,
                    "popup_width": "1000",
                    "popup_height": "650",
                    "support_host": "https://www.tradingview.com"
                };

                const container = document.getElementById(containerId.current);
                if (container) container.innerHTML = '';
                
                const widget = new window.TradingView.widget(widgetConfig);
                widgetRef.current = widget;
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = initWidget;
            document.head.appendChild(script);
        } else {
            if (window.TradingView) {
                initWidget();
            } else {
                script.addEventListener('load', initWidget);
                return () => {
                    script.removeEventListener('load', initWidget);
                };
            }
        }
    }, [theme]);

    useEffect(() => {
        return () => {
            widgetRef.current = null;
        };
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div className={styles.title}>Crude Oil WTI</div>
                <div className={styles.liveBadge}>
                    <div className={styles.liveDot}></div>
                    <span>Live</span>
                </div>
            </div>
            <div id={containerId.current} className={styles.widgetContainer} />
        </div>
    );
}

export default memo(TradingViewWidget);