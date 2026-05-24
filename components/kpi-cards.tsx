import { cn } from '@/lib/utils'

type KPI = {
  icon: string
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  suffix?: string
  bar: number
  barColor: string
  sub: string
}

type Props = {
  totalTopics: number
  masteredTopics: number
  stagesDone: number
  totalStages: number
  pct: number
}

export function KpiCards({ totalTopics, masteredTopics, stagesDone, totalStages, pct }: Props) {
  const remaining = totalStages - stagesDone
  const masteredPct = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0

  const readinessLabel = pct >= 80 ? 'Interview Ready' : pct >= 55 ? 'Almost There' : pct >= 30 ? 'In Progress' : 'Just Starting'

  const kpis: KPI[] = [
    {
      icon: '◆', iconBg: 'rgba(110,168,254,0.15)', iconColor: '#6EA8FE',
      label: 'Mastery', value: pct, suffix: '%',
      bar: pct, barColor: 'linear-gradient(90deg, #6EA8FE 0%, #66D19E 100%)',
      sub: `${stagesDone} of ${totalStages} stages checked`,
    },
    {
      icon: '✓', iconBg: 'rgba(102,209,158,0.15)', iconColor: '#66D19E',
      label: 'Topics Mastered', value: masteredTopics, suffix: `/${totalTopics}`,
      bar: masteredPct, barColor: '#66D19E',
      sub: `${totalTopics - masteredTopics} topics remaining`,
    },
    {
      icon: '▦', iconBg: 'rgba(244,143,177,0.15)', iconColor: '#F48FB1',
      label: 'Stages Done', value: stagesDone,
      bar: totalStages > 0 ? Math.round((stagesDone / totalStages) * 100) : 0,
      barColor: '#F48FB1',
      sub: `5 stages × ${totalTopics} topics`,
    },
    {
      icon: '⚑', iconBg: 'rgba(255,212,121,0.15)', iconColor: '#FFD479',
      label: 'Remaining', value: remaining,
      bar: totalStages > 0 ? Math.round((remaining / totalStages) * 100) : 0,
      barColor: '#FFD479',
      sub: readinessLabel,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className="bg-[#14171F] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
              style={{ background: k.iconBg, color: k.iconColor }}
            >
              {k.icon}
            </div>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/40">{k.label}</span>
          </div>
          <div className="text-4xl font-bold text-white tabular-nums leading-none mb-3">
            {k.value}
            {k.suffix && <span className="text-xl text-white/30 font-semibold ml-1">{k.suffix}</span>}
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${k.bar}%`, background: k.barColor }}
            />
          </div>
          <div className="text-xs text-white/30 font-medium">{k.sub}</div>
        </div>
      ))}
    </div>
  )
}
