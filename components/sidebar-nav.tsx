'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { TrackWithStats } from '@/lib/queries/tracks'
import { cn } from '@/lib/utils'

type Props = { tracks: TrackWithStats[] }

export function SidebarNav({ tracks }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-white/8 flex flex-col h-screen sticky top-0 bg-[#0B0D12]">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center font-black text-sm text-[#08101D] shrink-0">
            P
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-white/40">Prep Tracker</div>
            <div className="text-sm font-bold text-white leading-tight">Knowledge Map</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <NavLink href="/dashboard" active={pathname === '/dashboard'}>
          <span className="text-sm">◆</span>
          <span>Dashboard</span>
        </NavLink>

        <div className="px-2 mt-3 mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">Tracks</span>
        </div>

        {tracks.map((track) => (
          <NavLink key={track.slug} href={`/${track.slug}`} active={pathname === `/${track.slug}`}>
            <span className="text-sm shrink-0">{track.icon}</span>
            <span className="truncate flex-1">{track.name}</span>
            {track.pct > 0 && (
              <span className={cn(
                'text-[10px] font-bold shrink-0 tabular-nums',
                track.pct === 100 ? 'text-green-400' : 'text-white/40',
              )}>
                {track.pct}%
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/8">
        <div className="text-[10px] text-white/30 font-medium">227 topics · SQLite · saves locally</div>
      </div>
    </aside>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-white/10 text-white'
          : 'text-white/50 hover:text-white/80 hover:bg-white/5',
      )}
    >
      {children}
    </Link>
  )
}
