import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Icon from './components/Icon';
import { InstallPWA } from './components/InstallPWA';
import Nav from './components/Nav';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Shop List',
  description: 'Application simple pour gérer vos courses hebdomadaires',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shop List',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={
          inter.className +
          ' bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800'
        }
      >
        <div className="mx-auto flex h-dvh max-w-xl flex-col gap-2 p-4">
          <Icon />
          {children}
        </div>
        <Nav />
        <InstallPWA />
      </body>
    </html>
  );
}
