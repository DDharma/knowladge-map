import { db } from '@/lib/db'
import { tracks, sections, topics, topicStages, companies, topicCompanies, STAGES } from '@/lib/db/schema'
import type { Stage, Difficulty } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

export type { Stage, Difficulty }

export type StageMap = Record<Stage, boolean>

export type TopicWithStages = {
  id: number
  title: string
  isCritical: boolean
  active: boolean
  sortOrder: number
  url: string | null
  difficulty: Difficulty | null
  companies: string[]
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
  | 'easy'
  | 'medium'
  | 'hard'
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

const FILTER_DIFFICULTY_MAP: Partial<Record<FilterKey, Difficulty>> = {
  easy:   'EASY',
  medium: 'MEDIUM',
  hard:   'HARD',
}

export type TrackSectionOpts = {
  filter?: FilterKey
  companySlugs?: string[]
}

export function getTrackSections(trackSlug: string, opts: TrackSectionOpts = {}): SectionWithTopics[] {
  const { filter = 'all', companySlugs } = opts

  const [track] = db.select().from(tracks).where(eq(tracks.slug, trackSlug)).all()
  if (!track) return []

  const allSections = db.select().from(sections).where(eq(sections.trackId, track.id)).orderBy(sections.sortOrder).all()
  if (allSections.length === 0) return []

  const sectionIds = allSections.map((s) => s.id)
  const allTopics = db.select().from(topics).where(inArray(topics.sectionId, sectionIds)).orderBy(topics.sortOrder).all()
  if (allTopics.length === 0) return []

  const topicIds = allTopics.map((t) => t.id)

  // Batch stages
  const stagesByTopic = new Map<number, StageMap>()
  for (const t of allTopics) stagesByTopic.set(t.id, { R: false, W: false, U: false, Rv: false, P: false })
  if (topicIds.length > 0) {
    const stageRows = db.select().from(topicStages).where(inArray(topicStages.topicId, topicIds)).all()
    for (const s of stageRows) {
      const m = stagesByTopic.get(s.topicId)
      if (m) m[s.stage] = s.completed
    }
  }

  // Batch companies
  const companiesByTopic = new Map<number, string[]>()
  if (topicIds.length > 0) {
    const links = db
      .select({ topicId: topicCompanies.topicId, name: companies.name, frequency: topicCompanies.frequency })
      .from(topicCompanies)
      .innerJoin(companies, eq(topicCompanies.companyId, companies.id))
      .where(inArray(topicCompanies.topicId, topicIds))
      .all()
    const buckets = new Map<number, { name: string; frequency: number }[]>()
    for (const l of links) {
      const arr = buckets.get(l.topicId) ?? []
      arr.push({ name: l.name, frequency: l.frequency ?? 0 })
      buckets.set(l.topicId, arr)
    }
    for (const [id, arr] of buckets) {
      arr.sort((a, b) => b.frequency - a.frequency || a.name.localeCompare(b.name))
      companiesByTopic.set(id, arr.map((x) => x.name))
    }
  }

  // Optional company filter — slug-based; resolve to names
  let companyNameFilter: Set<string> | null = null
  if (companySlugs && companySlugs.length > 0) {
    const rows = db.select({ name: companies.name }).from(companies).where(inArray(companies.slug, companySlugs)).all()
    companyNameFilter = new Set(rows.map((r) => r.name))
  }

  // Build enriched topics, grouped by section
  const enrichedBySection = new Map<number, TopicWithStages[]>()
  for (const t of allTopics) {
    const stages = stagesByTopic.get(t.id)!
    const stagesDone = STAGES.filter((s) => stages[s]).length
    const enriched: TopicWithStages = {
      id: t.id,
      title: t.title,
      isCritical: t.isCritical,
      active: t.active,
      sortOrder: t.sortOrder,
      url: t.url,
      difficulty: t.difficulty,
      companies: companiesByTopic.get(t.id) ?? [],
      stages,
      mastered: stagesDone === 5,
      stagesDone,
    }
    const arr = enrichedBySection.get(t.sectionId) ?? []
    arr.push(enriched)
    enrichedBySection.set(t.sectionId, arr)
  }

  const result: SectionWithTopics[] = []
  for (const sec of allSections) {
    const sectionTopics = enrichedBySection.get(sec.id) ?? []
    let visible = applyFilter(sectionTopics, filter)
    if (companyNameFilter) {
      visible = visible.filter((t) => t.companies.some((c) => companyNameFilter!.has(c)))
    }
    if (visible.length === 0) continue

    const totalTopics = sectionTopics.length
    const secStagesDone = sectionTopics.reduce((a, t) => a + t.stagesDone, 0)
    const totalStages = totalTopics * 5
    const masteredTopics = sectionTopics.filter((t) => t.mastered).length
    const pct = totalStages > 0 ? Math.round((secStagesDone / totalStages) * 100) : 0

    result.push({
      id: sec.id, slug: sec.slug, name: sec.name, emoji: sec.emoji,
      color: sec.color, priority: sec.priority, dayRange: sec.dayRange, why: sec.why,
      topics: visible, totalTopics, masteredTopics, stagesDone: secStagesDone, totalStages, pct,
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
    case 'easy':
    case 'medium':
    case 'hard': {
      const d = FILTER_DIFFICULTY_MAP[filter]
      return topicList.filter((t) => t.difficulty === d)
    }
    default: {
      const stage = FILTER_STAGE_MAP[filter]
      if (stage) return topicList.filter((t) => !t.stages[stage])
      return topicList
    }
  }
}

export function getFilterCounts(trackSlug: string): Record<FilterKey, number> {
  const allSections = getTrackSections(trackSlug)
  const allTopics = allSections.flatMap((s) => s.topics)

  const filters: FilterKey[] = [
    'all', 'active', 'skipped',
    'easy', 'medium', 'hard',
    'need-read', 'need-write', 'need-understand', 'need-revised', 'need-perfect',
    'mastered', 'critical',
  ]
  const counts = {} as Record<FilterKey, number>
  for (const f of filters) {
    counts[f] = applyFilter(allTopics, f).length
  }
  return counts
}

export function getAllCompanies(): { slug: string; name: string }[] {
  return db.select({ slug: companies.slug, name: companies.name }).from(companies).orderBy(companies.name).all()
}
