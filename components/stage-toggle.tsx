'use client'

import { useTransition, useOptimistic } from 'react'
import { toggleStage } from '@/lib/actions/stages'
import type { StageMap } from '@/lib/queries/topics'
import type { Stage } from '@/lib/db/schema'
import { STAGES, STAGE_SHORT } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

type Props = {
  topicId: number
  stages: StageMap
  trackSlug: string
}

export function StageToggle({ topicId, stages, trackSlug }: Props) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStages, updateOptimistic] = useOptimistic(
    stages,
    (current: StageMap, update: { stage: Stage; completed: boolean }) => ({
      ...current,
      [update.stage]: update.completed,
    }),
  )

  const mastered = STAGES.every((s) => optimisticStages[s])

  function handleToggle(stage: Stage) {
    const newValue = !optimisticStages[stage]
    startTransition(async () => {
      updateOptimistic({ stage, completed: newValue })
      await toggleStage(topicId, stage, newValue, trackSlug)
    })
  }

  const stageTitles: Record<Stage, string> = {
    R: 'Read', W: 'Write', U: 'Understand', Rv: 'Revised', P: 'Perfect',
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      {mastered && (
        <span className="text-[10px] font-bold tracking-wide uppercase text-green-400 bg-green-400/10 border border-green-400/25 px-2 py-0.5 rounded-md mr-1">
          ✓ Mastered
        </span>
      )}
      {STAGES.map((stage) => {
        const on = optimisticStages[stage]
        return (
          <button
            key={stage}
            onClick={() => handleToggle(stage)}
            disabled={isPending}
            title={stageTitles[stage]}
            className={cn(
              'h-7 min-w-[28px] px-2 rounded-lg text-[11px] font-bold border transition-all duration-150',
              'disabled:opacity-60',
              on && mastered
                ? 'bg-green-400 border-green-400 text-[#08101D] shadow-[0_2px_8px_rgba(102,209,158,0.3)]'
                : on
                ? 'bg-blue-400 border-blue-400 text-[#08101D] shadow-[0_2px_8px_rgba(110,168,254,0.3)]'
                : 'bg-transparent border-white/15 text-white/40 hover:border-white/40 hover:text-white hover:-translate-y-px',
            )}
          >
            {STAGE_SHORT[stage]}
          </button>
        )
      })}
    </div>
  )
}
