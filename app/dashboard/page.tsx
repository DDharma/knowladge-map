import { getAllTracks, getOverallStats } from '@/lib/queries/tracks'
import { KpiCards } from '@/components/kpi-cards'
import { TrackOverviewCard } from '@/components/track-overview-card'
import { TrackRadarChart, TrackBarChart } from '@/components/progress-charts'

export default function DashboardPage() {
  const stats = getOverallStats()
  const tracks = getAllTracks()

  const readiness = stats.pct >= 80 ? 'Interview Ready' : stats.pct >= 55 ? 'Almost There' : stats.pct >= 30 ? 'In Progress' : 'Just Starting'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Track your progress across all domains</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-[#14171F] border border-white/8">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(102,209,158,0.2)]" />
          <span className="text-xs font-semibold text-white/60">{readiness}</span>
          <span className="text-xs font-bold text-white">· {stats.pct}%</span>
        </div>
      </div>

      <KpiCards {...stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-3 mb-5 xl:grid-cols-2">
        <TrackRadarChart tracks={tracks} />
        <TrackBarChart tracks={tracks} />
      </div>

      <div className="mb-4">
        <h2 className="text-xs font-bold tracking-widest uppercase text-white/30 mb-3">All Tracks</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {tracks.map((track) => (
            <TrackOverviewCard key={track.slug} track={track} />
          ))}
        </div>
      </div>
    </div>
  )
}
