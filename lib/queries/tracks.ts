import { db } from '@/lib/db'
import { tracks, sections, topics, topicStages } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export type TrackWithStats = {
  id: number
  slug: string
  name: string
  icon: string | null
  sortOrder: number
  totalTopics: number
  masteredTopics: number
  stagesDone: number
  totalStages: number
  pct: number
}

export function getAllTracks(): TrackWithStats[] {
  const rows = db
    .select({
      id:          tracks.id,
      slug:        tracks.slug,
      name:        tracks.name,
      icon:        tracks.icon,
      sortOrder:   tracks.sortOrder,
      totalTopics: sql<number>`COUNT(DISTINCT ${topics.id})`,
      stagesDone:  sql<number>`COALESCE(SUM(CASE WHEN ${topicStages.completed} = 1 THEN 1 ELSE 0 END), 0)`,
    })
    .from(tracks)
    .leftJoin(sections, eq(sections.trackId, tracks.id))
    .leftJoin(topics, eq(topics.sectionId, sections.id))
    .leftJoin(topicStages, eq(topicStages.topicId, topics.id))
    .groupBy(tracks.id)
    .orderBy(tracks.sortOrder)
    .all()

  return rows.map((r) => {
    const totalTopics = r.totalTopics ?? 0
    const stagesDone = r.stagesDone ?? 0
    const totalStages = totalTopics * 5
    const masteredTopics = getMasteredCount(r.id)
    const pct = totalStages > 0 ? Math.round((stagesDone / totalStages) * 100) : 0
    return { ...r, totalTopics, stagesDone, totalStages, masteredTopics, pct }
  })
}

function getMasteredCount(trackId: number): number {
  const result = db.get<{ n: number }>(sql`
    SELECT COUNT(*) as n FROM topics t
    JOIN sections s ON s.id = t.section_id
    WHERE s.track_id = ${trackId}
    AND (
      SELECT COUNT(*) FROM topic_stages ts
      WHERE ts.topic_id = t.id AND ts.completed = 1
    ) = 5
  `)
  return result?.n ?? 0
}

export function getTrackBySlug(slug: string) {
  const [track] = db.select().from(tracks).where(eq(tracks.slug, slug)).all()
  return track ?? null
}

export type SectionStat = {
  name: string
  pct: number
  stagesDone: number
  totalStages: number
}

export function getTrackSectionStats(trackSlug: string): SectionStat[] {
  const rows = db.all<{ name: string; stagesDone: number; totalTopics: number }>(sql`
    SELECT s.name, s.sort_order,
      COUNT(DISTINCT t.id) as totalTopics,
      COALESCE(SUM(CASE WHEN ts.completed = 1 THEN 1 ELSE 0 END), 0) as stagesDone
    FROM sections s
    JOIN tracks tr ON tr.id = s.track_id
    LEFT JOIN topics t ON t.section_id = s.id
    LEFT JOIN topic_stages ts ON ts.topic_id = t.id
    WHERE tr.slug = ${trackSlug}
    GROUP BY s.id
    ORDER BY s.sort_order
  `)
  return rows.map((r) => {
    const totalStages = (r.totalTopics ?? 0) * 5
    const stagesDone = r.stagesDone ?? 0
    const pct = totalStages > 0 ? Math.round((stagesDone / totalStages) * 100) : 0
    return { name: r.name, pct, stagesDone, totalStages }
  })
}

export function getOverallStats() {
  const row = db.get<{ totalTopics: number; stagesDone: number }>(sql`
    SELECT
      COUNT(DISTINCT t.id) as totalTopics,
      COALESCE(SUM(CASE WHEN ts.completed = 1 THEN 1 ELSE 0 END), 0) as stagesDone
    FROM topics t
    LEFT JOIN topic_stages ts ON ts.topic_id = t.id
  `)
  const masteredRow = db.get<{ n: number }>(sql`
    SELECT COUNT(*) as n FROM topics t
    WHERE (
      SELECT COUNT(*) FROM topic_stages ts
      WHERE ts.topic_id = t.id AND ts.completed = 1
    ) = 5
  `)

  const totalTopics = row?.totalTopics ?? 0
  const stagesDone = row?.stagesDone ?? 0
  const totalStages = totalTopics * 5
  const masteredTopics = masteredRow?.n ?? 0
  const pct = totalStages > 0 ? Math.round((stagesDone / totalStages) * 100) : 0
  return { totalTopics, stagesDone, totalStages, masteredTopics, pct }
}
