'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, useRef, useEffect } from 'react'
import type { FilterKey } from '@/lib/queries/topics'
import { cn } from '@/lib/utils'

const BASE_FILTERS: { key: FilterKey; label: string }[] = [
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

const DIFFICULTY_FILTERS: { key: FilterKey; label: string; tone: string }[] = [
  { key: 'easy',   label: 'Easy',   tone: 'green' },
  { key: 'medium', label: 'Medium', tone: 'amber' },
  { key: 'hard',   label: 'Hard',   tone: 'red' },
]

type CompanyOption = { slug: string; name: string }

type Props = {
  counts: Record<FilterKey, number>
  trackSlug: string
  showDifficultyAndCompany?: boolean
  companyOptions?: CompanyOption[]
}

export function TopicFilterBar({ counts, trackSlug, showDifficultyAndCompany = false, companyOptions = [] }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = (searchParams.get('filter') as FilterKey) || 'all'
  const selectedCompanySlugs = useMemo(() => {
    const raw = searchParams.get('company')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [searchParams])

  function setFilter(key: FilterKey) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'all') params.delete('filter')
    else params.set('filter', key)
    const qs = params.toString()
    router.push(qs ? `/${trackSlug}?${qs}` : `/${trackSlug}`)
  }

  function setCompanies(slugs: string[]) {
    const params = new URLSearchParams(searchParams.toString())
    if (slugs.length === 0) params.delete('company')
    else params.set('company', slugs.join(','))
    const qs = params.toString()
    router.push(qs ? `/${trackSlug}?${qs}` : `/${trackSlug}`)
  }

  const filters = showDifficultyAndCompany
    ? [
        BASE_FILTERS[0], // All
        ...DIFFICULTY_FILTERS.map((d) => ({ key: d.key, label: d.label })),
        ...BASE_FILTERS.slice(1),
      ]
    : BASE_FILTERS

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {filters.map((f) => (
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

      {showDifficultyAndCompany && companyOptions.length > 0 && (
        <CompanyMultiSelect
          options={companyOptions}
          selected={selectedCompanySlugs}
          onChange={setCompanies}
        />
      )}
    </div>
  )
}

function CompanyMultiSelect({
  options, selected, onChange,
}: {
  options: CompanyOption[]
  selected: string[]
  onChange: (slugs: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open])

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options.slice(0, 200)
    return options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 200)
  }, [options, query])

  function toggle(slug: string) {
    const next = selectedSet.has(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]
    onChange(next)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-all duration-150',
          selected.length > 0
            ? 'bg-blue-400 border-blue-400 text-[#08101D]'
            : 'bg-transparent border-white/15 text-white/50 hover:border-white/30 hover:text-white/80',
        )}
      >
        Companies
        {selected.length > 0 && (
          <span className="text-[10px] font-bold bg-black/15 text-[#08101D] px-1.5 py-0.5">
            {selected.length}
          </span>
        )}
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 max-h-96 overflow-hidden rounded-xl border border-white/15 bg-[#14171F] shadow-2xl flex flex-col">
          <div className="p-2 border-b border-white/8 flex items-center gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none px-2 py-1"
            />
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="text-[11px] text-white/40 hover:text-white/80"
              >
                Clear
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-white/30 text-center">No matches</div>
            ) : (
              filtered.map((o) => {
                const checked = selectedSet.has(o.slug)
                return (
                  <button
                    key={o.slug}
                    onClick={() => toggle(o.slug)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-white/5"
                  >
                    <span className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                      checked ? 'bg-blue-400 border-blue-400' : 'border-white/20',
                    )}>
                      {checked && (
                        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-[#08101D]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                        </svg>
                      )}
                    </span>
                    <span className={cn('truncate', checked ? 'text-white' : 'text-white/70')}>{o.name}</span>
                  </button>
                )
              })
            )}
            {query.trim() === '' && options.length > 200 && (
              <div className="px-3 py-2 text-[11px] text-white/30 text-center">
                Showing first 200 — type to search the rest
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
