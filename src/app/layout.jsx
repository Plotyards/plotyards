import '../index.css';
import '../App.css';
import { Providers } from './Providers';
import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import TrafficHeartbeat from '../components/TrafficHeartbeat';
import CompareWidget from '../components/CompareWidget';
import CompareModal from '../components/CompareModal';

export const metadata = {
  title: {
    template: '%s | Plotyards',
    default: 'Plotyards - Real Estate & Investment',
  },
  description: 'Find the best land, properties, and investment opportunities in India. Compare real estate vs stock market ROI.',
};

import { Suspense } from 'react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text flex flex-col antialiased">
        <Providers>
          <TrafficHeartbeat />
          <Suspense fallback={<div className="h-20" />}>
            <Navbar />
          </Suspense>
          <AnnouncementBar />
          <main className="flex-grow">
            <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <Footer />
          <CompareWidget />
          <CompareModal />
        </Providers>
      </body>
    </html>
  );
}
