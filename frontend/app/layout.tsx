import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dineasy - Find Your Perfect Table Experience',
  description: 'AI-powered restaurant discovery and reservation platform. Search across OpenTable, Resy, Yelp, Tock, and Google in one place.',
  keywords: 'restaurant reservations, dining, OpenTable, Resy, Yelp, restaurant booking, AI dining',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
