import './globals.css';

export const metadata = {
    title: 'Oil Price Forecasting Dashboard',
    description: 'Advanced analytics for oil price trends and predictions',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
