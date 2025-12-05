import styles from './Loading.module.css';

export default function Loading() {
    return (
        <div className={styles.container}>
            <div className={styles.scene}>
                <div className={styles.shipWrapper}>
                    <div className={styles.smokeContainer}>
                        <div className={styles.smoke}></div>
                        <div className={styles.smoke}></div>
                        <div className={styles.smoke}></div>
                    </div>
                    <svg className={styles.ship} viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Modern Hull */}
                        <path d="M10 60 Q 40 90 100 90 T 190 60 L 180 40 H 20 L 10 60 Z" fill="url(#hullGradient)" stroke="#0369a1" strokeWidth="1" />
                        <defs>
                            <linearGradient id="hullGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="100%" stopColor="#0369a1" />
                            </linearGradient>
                        </defs>

                        {/* Deck/Superstructure */}
                        <path d="M30 40 L 40 20 H 160 L 170 40 H 30 Z" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="1" />
                        <rect x="50" y="10" width="80" height="10" rx="2" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1" />

                        {/* Bridge */}
                        <path d="M110 10 L 115 0 H 145 L 140 10 H 110 Z" fill="#38bdf8" opacity="0.8" />

                        {/* Windows */}
                        <circle cx="60" cy="30" r="3" fill="#7dd3fc" />
                        <circle cx="80" cy="30" r="3" fill="#7dd3fc" />
                        <circle cx="100" cy="30" r="3" fill="#7dd3fc" />
                        <circle cx="120" cy="30" r="3" fill="#7dd3fc" />
                        <circle cx="140" cy="30" r="3" fill="#7dd3fc" />

                        {/* Modern Smokestack */}
                        <path d="M70 10 L 65 -10 H 85 L 80 10 H 70 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                        <path d="M65 -5 H 85" stroke="#b91c1c" strokeWidth="2" opacity="0.5" />

                        {/* Details */}
                        <path d="M10 60 L 190 60" stroke="#0c4a6e" strokeWidth="1" opacity="0.3" />
                    </svg>
                </div>
                <div className={styles.water}>
                    
                    {/* Bubbles */}
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>

                    <p className={styles.text}>Loading Dashboard Data...</p>
                </div>
            </div>
        </div>
    );
}
