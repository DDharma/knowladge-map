'use client'

import { useTransition, useOptimistic } from 'react'
import { toggleTopicActive } from '@/lib/actions/stages'
import { cn } from '@/lib/utils'

type Props = {
  topicId: number
  active: boolean
  trackSlug: string
}

export function TopicActiveCheckbox({ topicId, active, trackSlug }: Props) {
  const [isPending, startTransition] = useTransition()
  const [optimisticActive, setOptimisticActive] = useOptimistic(active, (_: boolean, next: boolean) => next)

  function handleToggle() {
    const next = !optimisticActive
    startTransition(async () => {
      setOptimisticActive(next)
      await toggleTopicActive(topicId, next, trackSlug)
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={optimisticActive}
      title={optimisticActive ? 'Studying this topic — click to skip' : 'Skipped — click to study'}
      className={cn(
        'shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 disabled:opacity-60',
        optimisticActive
          ? 'bg-blue-400 border-blue-400 text-[#08101D] shadow-[0_2px_8px_rgba(110,168,254,0.3)]'
          : 'bg-transparent border-white/20 hover:border-white/40',
      )}
    >
      {optimisticActive && (
        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" />
        </svg>
      )}
    </button>
  )
}
