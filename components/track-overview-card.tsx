import Link from 'next/link'
import type { TrackWithStats } from '@/lib/queries/tracks'
import { cn } from '@/lib/utils'

const PRIORITY_COLORS: Record<string, string> = {
  FOUNDATION:   '#6EA8FE',
  CRITICAL:     '#FF6B6B',
  'CORE SKILL': '#FFB86C',
  IMPORTANT:    '#FFD479',
  MODERATE:     '#C9D0DC',
  'YOUR EDGE':  '#66D19E',
  ADVANCED:     '#A0B4D6',
}

type Props = { track: TrackWithStats }

export function TrackOverviewCard({ track }: Props) {
  const isComingSoon = track.totalTopics === 0
  const masteredPct = track.totalTopics > 0 ? Math.round((track.masteredTopics / track.totalTopics) * 100) : 0

  return (
    <Link
      href={`/${track.slug}`}
      className={cn(
        'block bg-[#14171F] border border-white/8 rounded-2xl p-5 transition-all duration-150',
        'hover:border-white/20 hover:bg-[#1A1E28]',
        isComingSoon && 'opacity-50 pointer-events-none',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{track.icon}</span>
          <div>
            <div className="font-bold text-white text-base leading-tight">{track.name}</div>
            <div className="text-xs text-white/30 mt-0.5">
              {isComingSoon ? 'Coming soon' : `${track.totalTopics} topics`}
            </div>
          </div>
        </div>
        <div className={cn(
          'text-2xl font-bold tabular-nums leading-none',
          track.pct === 100 ? 'text-green-400' : 'text-white',
        )}>
          {track.pct}<span className="text-sm text-white/30 font-semibold">%</span>
        </div>
      </div>

      {!isComingSoon && (
        <>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${track.pct}%`,
                background: track.pct === 100 ? '#66D19E' : '#6EA8FE',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-white/30 font-medium">
            <span>{track.masteredTopics}/{track.totalTopics} mastered</span>
            <span>{track.stagesDone}/{track.totalStages} stages</span>
          </div>
        </>
      )}
    </Link>
  )
}
