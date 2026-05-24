import type { SectionWithTopics } from '@/lib/queries/topics'
import { StageToggle } from './stage-toggle'
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

type Props = {
  section: SectionWithTopics
  trackSlug: string
}

export function TopicSection({ section, trackSlug }: Props) {
  const priColor = PRIORITY_COLORS[section.priority ?? ''] ?? '#C9D0DC'
  const isComplete = section.pct === 100

  return (
    <div className={cn(
      'border rounded-2xl overflow-hidden transition-all duration-150',
      isComplete
        ? 'border-green-400/40 shadow-[0_0_0_4px_rgba(102,209,158,0.08)]'
        : 'border-white/8 hover:border-white/15',
    )}>
      {/* Section header */}
      <div className="bg-[#14171F] px-5 py-4 border-b border-white/8">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: (section.color ?? '#6EA8FE') + '1F',
              boxShadow: `inset 0 0 0 1px ${(section.color ?? '#6EA8FE')}55`,
            }}
          >
            {section.emoji}
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">{section.name}</h2>
              {isComplete && (
                <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/25 px-2 py-0.5 rounded-md">
                  Complete
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {section.priority && (
                <span
                  className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md text-[#08101D]"
                  style={{ background: priColor }}
                >
                  {section.priority}
                </span>
              )}
              {section.dayRange && (
                <span className="text-[10px] font-semibold text-white/30 bg-white/5 border border-white/8 px-2 py-0.5 rounded-md">
                  Day {section.dayRange}
                </span>
              )}
              <span className="text-[10px] font-semibold text-white/30 bg-white/5 border border-white/8 px-2 py-0.5 rounded-md">
                {section.masteredTopics}/{section.totalTopics} mastered
              </span>
            </div>
            {section.why && (
              <p className="text-xs text-white/30 mt-2 leading-relaxed max-w-2xl font-medium">{section.why}</p>
            )}
          </div>

          {/* Progress */}
          <div className="shrink-0 text-right">
            <div className={cn(
              'text-3xl font-bold tabular-nums leading-none',
              isComplete ? 'text-green-400' : 'text-white',
            )}>
              {section.pct}<span className="text-sm text-white/30 ml-0.5">%</span>
            </div>
            <div className="w-36 h-1 bg-white/5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${section.pct}%`,
                  background: isComplete ? '#66D19E' : (section.color ?? '#6EA8FE'),
                }}
              />
            </div>
            <div className="text-[11px] text-white/25 font-medium mt-1.5">
              {section.stagesDone}/{section.totalStages} stages
            </div>
          </div>
        </div>
      </div>

      {/* Topics list */}
      <ul>
        {section.topics.map((topic, idx) => (
          <li
            key={topic.id}
            className={cn(
              'flex items-center gap-3 px-5 py-3 border-b border-white/5 last:border-0 transition-colors',
              topic.mastered
                ? 'bg-gradient-to-r from-green-400/5 via-green-400/2 to-transparent hover:from-green-400/8'
                : 'hover:bg-white/3',
            )}
          >
            <span className={cn(
              'text-xs font-bold tabular-nums w-6 text-right shrink-0',
              topic.mastered ? 'text-green-400' : 'text-white/25',
            )}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span className={cn(
              'flex-1 text-sm leading-relaxed',
              topic.mastered ? 'text-white' : 'text-white/60',
            )}>
              {topic.title}
              {topic.isCritical && (
                <span className="ml-2 text-[9px] font-bold tracking-wide uppercase text-blue-400/70 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded">
                  Critical
                </span>
              )}
            </span>
            <StageToggle topicId={topic.id} stages={topic.stages} trackSlug={trackSlug} />
          </li>
        ))}
      </ul>
    </div>
  )
}
