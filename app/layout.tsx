import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '@/components/app-sidebar'
import { getAllTracks } from '@/lib/queries/tracks'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Prep Tracker · Knowledge Map',
  description: 'Track your learning progress across all tech domains',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tracks = getAllTracks()

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-[#0B0D12] text-white font-sans antialiased">
        <TooltipProvider>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar tracks={tracks} />
          <SidebarInset className="bg-[#0B0D12]">
            <main>
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
