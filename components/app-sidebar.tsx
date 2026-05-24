'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import type { TrackWithStats } from '@/lib/queries/tracks'
import { cn } from '@/lib/utils'

type Props = { tracks: TrackWithStats[] }

export function AppSidebar({ tracks }: Props) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-white/8 bg-[#0B0D12]">
      {/* Brand header */}
      <SidebarHeader className="border-b border-white/8 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center font-black text-sm text-[#08101D] shrink-0">
            P
          </div>
          <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-white/40 truncate">
              Prep Tracker
            </div>
            <div className="text-sm font-bold text-white leading-tight truncate">
              Knowledge Map
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        {/* Dashboard link */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip="Dashboard"
                className={cn(
                  'transition-colors',
                  pathname === '/dashboard'
                    ? 'bg-white/10 text-white hover:bg-white/15'
                    : 'text-white/50 hover:text-white hover:bg-white/5',
                )}
              >
                <Link href="/dashboard">
                  <span className="text-base">◆</span>
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Tracks */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/30 text-[10px] tracking-widest uppercase">
            Tracks
          </SidebarGroupLabel>
          <SidebarMenu>
            {tracks.map((track) => {
              const isActive = pathname === `/${track.slug}`
              return (
                <SidebarMenuItem key={track.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={track.name}
                    className={cn(
                      'transition-colors',
                      isActive
                        ? 'bg-white/10 text-white hover:bg-white/15'
                        : 'text-white/50 hover:text-white hover:bg-white/5',
                    )}
                  >
                    <Link href={`/${track.slug}`}>
                      <span className="text-base shrink-0">{track.icon}</span>
                      <span className="truncate flex-1">{track.name}</span>
                      {track.pct > 0 && (
                        <span className={cn(
                          'text-[10px] font-bold tabular-nums shrink-0 group-data-[collapsible=icon]:hidden',
                          track.pct === 100 ? 'text-green-400' : 'text-white/35',
                        )}>
                          {track.pct}%
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/8 py-3">
        <div className="flex items-center justify-between px-2">
          <div className="text-[10px] text-white/25 font-medium group-data-[collapsible=icon]:hidden">
            227 topics · SQLite
          </div>
          <SidebarTrigger className="text-white/40 hover:text-white hover:bg-white/5" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
