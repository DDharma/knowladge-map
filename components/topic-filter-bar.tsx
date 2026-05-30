'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { FilterKey } from '@/lib/queries/topics'
import { cn } from '@/lib/utils'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',             label: 'All Topics' },
  { key: 'active',          label: 'Studying' },
  { key: 'skipped',         label: 'Skipped' },
  { key: 'critical',        label: 'Must Know' },
  { key: 'need-read',       label: 'Need Read' },
  { key: 'need-write',      label: 'Need Write' },
  { key: 'need-understand', label: 'Need Understand' },
  { key: 'need-revised',    label: 'Need Revised' },
  { key: 'need-perfect',    label: 'Need Perfect' },
  { key: 'mastered',        label: 'Mastered' },
]

type Props = {
  counts: Record<FilterKey, number>
  trackSlug: string
}

export function TopicFilterBar({ counts, trackSlug }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = (searchParams.get('filter') as FilterKey) || 'all'

  function setFilter(key: FilterKey) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', key)
    }
    router.push(`/${trackSlug}?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-all duration-150',
            active === f.key
              ? 'bg-white text-[#0B0D12] border-white'
              : 'bg-transparent border-white/15 text-white/50 hover:border-white/30 hover:text-white/80',
          )}
        >
          {f.label}
          <span className={cn(
            'text-[10px] font-bold px-1.5 py-0.5',
            active === f.key ? 'bg-black/15 text-[#0B0D12]' : 'bg-white/8 text-white/30',
          )}>
            {counts[f.key]}
          </span>
        </button>
      ))}
    </div>
  )
}
