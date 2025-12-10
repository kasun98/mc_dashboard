import './globals.css';
import BackgroundEffect from '../components/BackgroundEffect';

export const metadata = {
    title: 'Oil Price Forecasting Dashboard',
    description: 'Advanced analytics for oil price trends and predictions',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <BackgroundEffect />
                <div style={{ position: 'relative', zIndex: 5 }}>
                    {children}
                </div>
            </body>
        </html>
    );
}
