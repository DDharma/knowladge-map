import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getTrackBySlug } from '@/lib/queries/tracks'
import { getTrackSections, getFilterCounts } from '@/lib/queries/topics'
import type { FilterKey } from '@/lib/queries/topics'
import { TopicFilterBar } from '@/components/topic-filter-bar'
import { TopicSection } from '@/components/topic-section'
import { KpiCards } from '@/components/kpi-cards'

type Props = {
  params: Promise<{ track: string }>
  searchParams: Promise<{ filter?: string }>
}

export default async function TrackPage({ params, searchParams }: Props) {
  const { track: slug } = await params
  const { filter: rawFilter } = await searchParams
  const filter = (rawFilter as FilterKey) || 'all'

  const track = getTrackBySlug(slug)
  if (!track) notFound()

  const sections = getTrackSections(slug, filter)
  const counts = getFilterCounts(slug)

  // Compute per-track KPIs from unfiltered data
  const allSections = getTrackSections(slug, 'all')
  const allTopics = allSections.flatMap((s) => s.topics)
  const totalTopics = allTopics.length
  const stagesDone = allTopics.reduce((a, t) => a + t.stagesDone, 0)
  const totalStages = totalTopics * 5
  const masteredTopics = allTopics.filter((t) => t.mastered).length
  const pct = totalStages > 0 ? Math.round((stagesDone / totalStages) * 100) : 0

  const isComingSoon = totalTopics === 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{track.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{track.name}</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {isComingSoon ? 'Topics coming soon' : `${totalTopics} topics · ${allSections.length} sections`}
          </p>
        </div>
      </div>

      {isComingSoon ? (
        <div className="border border-dashed border-white/15 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">{track.icon}</div>
          <div className="text-lg font-bold text-white mb-2">{track.name} — Coming Soon</div>
          <div className="text-sm text-white/40">Topics will be added here once the curriculum is ready.</div>
        </div>
      ) : (
        <>
          <KpiCards
            totalTopics={totalTopics}
            masteredTopics={masteredTopics}
            stagesDone={stagesDone}
            totalStages={totalStages}
            pct={pct}
          />

          <div className="mb-5">
            <Suspense>
              <TopicFilterBar counts={counts} trackSlug={slug} />
            </Suspense>
          </div>

          <div className="flex flex-col gap-4">
            {sections.length === 0 ? (
              <div className="border border-dashed border-white/15 rounded-2xl p-12 text-center">
                <div className="text-white/40 font-semibold mb-1">No topics match this filter</div>
                <div className="text-sm text-white/25">Try &quot;All Topics&quot; to see everything</div>
              </div>
            ) : (
              sections.map((sec) => (
                <TopicSection key={sec.id} section={sec} trackSlug={slug} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
