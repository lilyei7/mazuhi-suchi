import type { Metadata, Viewport } from 'next'
import { Inter, Teko } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import CartSidebar from '@/components/CartSidebar'
import CartFloatingButton from '@/components/CartFloatingButton'
import BottomNavigation from '@/components/BottomNavigation'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true
})
const teko = Teko({
  weight: '500',
  subsets: ['latin'],
  variable: '--font-teko',
  display: 'swap',
  preload: true
})

export const metadata: Metadata = {
  title: {
    default: 'Mazuhi Sushi - Fusión Sinaloense-Oriental',
    template: '%s | Mazuhi Sushi'
  },
  description: 'Disfruta de la mejor fusión culinaria sinaloense-oriental con mariscos frescos. Sabores únicos de Sinaloa con toques orientales. Delivery disponible.',
  keywords: ['sushi', 'restaurante sinaloa', 'comida oriental', 'mariscos frescos', 'fusión sinaloense', 'rolls', 'makis', 'delivery'],
  authors: [{ name: 'Mazuhi Sushi' }],
  creator: 'Mazuhi Sushi',
  publisher: 'Mazuhi Sushi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/images/favicon.png', sizes: 'any' },
      { url: '/images/favicon.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon.png', sizes: '32x32', type: 'image/png' }
    ],
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://mazuhisushi.com',
    title: 'Mazuhi Sushi - Fusión Sinaloense-Oriental',
    description: 'Disfruta de la mejor fusión culinaria sinaloense-oriental con mariscos frescos.',
    siteName: 'Mazuhi Sushi',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mazuhi Sushi - Fusión culinaria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mazuhi Sushi - Fusión Sinaloense-Oriental',
    description: 'Disfruta de la mejor fusión culinaria sinaloense-oriental con mariscos frescos.',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#e09e7d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        {/* Preload recursos críticos */}
        <link rel="preload" href="/images/gabo.png" as="image" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preconnect" href="https://i.postimg.cc" crossOrigin="" />
      </head>
      <body className={`${inter.className} ${teko.variable} antialiased`}>
        <CartProvider>
          {children}
          <CartSidebar />
          <CartFloatingButton />
          <BottomNavigation />
        </CartProvider>
      </body>
    </html>
  )
}