import { db } from '@/lib/db'
import { tracks, sections, topics, topicStages, STAGES } from '@/lib/db/schema'
import type { Stage } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type { Stage }

export type StageMap = Record<Stage, boolean>

export type TopicWithStages = {
  id: number
  title: string
  isCritical: boolean
  active: boolean
  sortOrder: number
  stages: StageMap
  mastered: boolean
  stagesDone: number
}

export type SectionWithTopics = {
  id: number
  slug: string
  name: string
  emoji: string | null
  color: string | null
  priority: string | null
  dayRange: string | null
  why: string | null
  topics: TopicWithStages[]
  totalTopics: number
  masteredTopics: number
  stagesDone: number
  totalStages: number
  pct: number
}

export type FilterKey =
  | 'all'
  | 'active'
  | 'skipped'
  | 'need-read'
  | 'need-write'
  | 'need-understand'
  | 'need-revised'
  | 'need-perfect'
  | 'mastered'
  | 'critical'

const FILTER_STAGE_MAP: Partial<Record<FilterKey, Stage>> = {
  'need-read':       'R',
  'need-write':      'W',
  'need-understand': 'U',
  'need-revised':    'Rv',
  'need-perfect':    'P',
}

export function getTrackSections(trackSlug: string, filter: FilterKey = 'all'): SectionWithTopics[] {
  const [track] = db.select().from(tracks).where(eq(tracks.slug, trackSlug)).all()
  if (!track) return []

  const allSections = db.select().from(sections).where(eq(sections.trackId, track.id)).orderBy(sections.sortOrder).all()

  const result: SectionWithTopics[] = []

  for (const sec of allSections) {
    const allTopics = db.select().from(topics).where(eq(topics.sectionId, sec.id)).orderBy(topics.sortOrder).all()

    const topicsWithStages: TopicWithStages[] = []
    for (const t of allTopics) {
      const stageRows = db.select().from(topicStages).where(eq(topicStages.topicId, t.id)).all()
      const stages: StageMap = { R: false, W: false, U: false, Rv: false, P: false }
      for (const s of stageRows) {
        stages[s.stage] = s.completed
      }
      const stagesDone = STAGES.filter((s) => stages[s]).length
      topicsWithStages.push({ ...t, stages, mastered: stagesDone === 5, stagesDone })
    }

    const filtered = applyFilter(topicsWithStages, filter)
    if (filtered.length === 0) continue

    const totalTopics = allTopics.length
    const secStagesDone = topicsWithStages.reduce((a, t) => a + t.stagesDone, 0)
    const totalStages = totalTopics * 5
    const masteredTopics = topicsWithStages.filter((t) => t.mastered).length
    const pct = totalStages > 0 ? Math.round((secStagesDone / totalStages) * 100) : 0

    result.push({
      id: sec.id, slug: sec.slug, name: sec.name, emoji: sec.emoji,
      color: sec.color, priority: sec.priority, dayRange: sec.dayRange, why: sec.why,
      topics: filtered, totalTopics, masteredTopics, stagesDone: secStagesDone, totalStages, pct,
    })
  }

  return result
}

function applyFilter(topicList: TopicWithStages[], filter: FilterKey): TopicWithStages[] {
  switch (filter) {
    case 'all':      return topicList
    case 'active':   return topicList.filter((t) => t.active)
    case 'skipped':  return topicList.filter((t) => !t.active)
    case 'mastered': return topicList.filter((t) => t.mastered)
    case 'critical': return topicList.filter((t) => t.isCritical)
    default: {
      const stage = FILTER_STAGE_MAP[filter]
      if (stage) return topicList.filter((t) => !t.stages[stage])
      return topicList
    }
  }
}

export function getFilterCounts(trackSlug: string): Record<FilterKey, number> {
  const allSections = getTrackSections(trackSlug, 'all')
  const allTopics = allSections.flatMap((s) => s.topics)

  const filters: FilterKey[] = ['all', 'active', 'skipped', 'need-read', 'need-write', 'need-understand', 'need-revised', 'need-perfect', 'mastered', 'critical']
  const counts = {} as Record<FilterKey, number>
  for (const f of filters) {
    counts[f] = applyFilter(allTopics, f).length
  }
  return counts
}
