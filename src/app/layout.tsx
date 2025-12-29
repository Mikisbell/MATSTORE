import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';

/**
 * Fuentes según Volumen V: Claridad Industrial
 * - Inter: Texto general
 * - Roboto Mono: Números y precios
 */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MatStore POS',
  description: 'Sistema Operativo de Retail Offline-First para LATAM',
  keywords: ['pos', 'retail', 'offline-first', 'peru', 'inventario'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
