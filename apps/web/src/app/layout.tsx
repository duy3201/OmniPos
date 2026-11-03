import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider, NoticeProvider } from '@/components/ui';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'OmniPOS - Quản Lý Bán Hàng & Kho Vật Tư Thủy Sản',
  description: 'Hệ thống POS bán hàng siêu tốc, quản lý thẻ kho bất biến, theo dõi số lô hạn dùng và công nợ vụ nuôi cho cửa hàng vật tư thủy sản.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased select-none overflow-x-hidden">
        <ToastProvider>
          <NoticeProvider>{children}</NoticeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
