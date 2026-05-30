'use client';

import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

// Metadata and Viewport are handled separately or omitted in client layout files to prevent Next.js build issues in client mode.


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <div className="global-bg"></div>
        <LayoutHelper>{children}</LayoutHelper>
      </body>
    </html>
  );
}

// Client component helper to toggle landing active state
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function LayoutHelper({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      document.body.classList.add('landing-active');
    } else {
      document.body.classList.remove('landing-active');
    }
  }, [pathname]);

  return <>{children}</>;
}
