import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Pit Stop 2.0 — Comande Tavoli',
  description: 'Gestione comande ai tavoli, menu QR multilingua e stampa ESC/POS per Pizzeria Pit Stop 2.0.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${barlow.variable} ${dmSans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
