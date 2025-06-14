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
    startupImage: [
      {
        url: '/icons/ios/1024.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/ios/1024.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/ios/1024.png',
        media:
          '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/ios/1024.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/ios/1024.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  icons: {
    apple: [
      { url: '/icons/ios/180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/ios/167.png', sizes: '167x167', type: 'image/png' },
      { url: '/icons/ios/152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/ios/120.png', sizes: '120x120', type: 'image/png' },
    ],
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
