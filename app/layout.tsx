import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SidebarNav } from '@/components/sidebar-nav'
import { getAllTracks } from '@/lib/queries/tracks'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Prep Tracker · Knowledge Map',
  description: 'Track your learning progress across all tech domains',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tracks = getAllTracks()

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0B0D12] text-white font-sans antialiased min-h-screen flex">
        <SidebarNav tracks={tracks} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
