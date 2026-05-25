import Database from 'better-sqlite3'

const sqlite = new Database(process.env.DATABASE_URL ?? './data/prep.db')
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

type SectionGroup = { track_id: number; slug: string; keeper_id: number; all_ids: string; cnt: number }
type TopicGroup = { title: string; keeper_topic_id: number; all_topic_ids: string }
type Count = { n: number }

function snapshot() {
  return {
    sections: (sqlite.prepare('SELECT COUNT(*) as n FROM sections').get() as Count).n,
    topics: (sqlite.prepare('SELECT COUNT(*) as n FROM topics').get() as Count).n,
    stages: (sqlite.prepare('SELECT COUNT(*) as n FROM topic_stages').get() as Count).n,
    completed: (sqlite.prepare('SELECT COUNT(*) as n FROM topic_stages WHERE completed = 1').get() as Count).n,
  }
}

function dedupe() {
  const before = snapshot()
  console.log('Before:', before)

  const sectionGroups = sqlite.prepare(`
    SELECT track_id, slug, MIN(id) as keeper_id,
           GROUP_CONCAT(id) as all_ids, COUNT(*) as cnt
    FROM sections
    GROUP BY track_id, slug
  `).all() as SectionGroup[]

  const run = sqlite.transaction(() => {
    let dupGroupsProcessed = 0
    let topicsDeleted = 0
    let sectionsDeleted = 0
    let progressMerged = 0

    for (const grp of sectionGroups) {
      const allSectionIds = grp.all_ids.split(',').map(Number)
      const nonKeeperSectionIds = allSectionIds.filter((id) => id !== grp.keeper_id)
      if (nonKeeperSectionIds.length === 0) continue
      dupGroupsProcessed++

      const sectionPlaceholders = allSectionIds.map(() => '?').join(',')
      const topicGroups = sqlite.prepare(`
        SELECT title, MIN(id) as keeper_topic_id, GROUP_CONCAT(id) as all_topic_ids
        FROM topics
        WHERE section_id IN (${sectionPlaceholders})
        GROUP BY title
      `).all(...allSectionIds) as TopicGroup[]

      for (const tg of topicGroups) {
        const allTopicIds = tg.all_topic_ids.split(',').map(Number)
        const nonKeeperTopicIds = allTopicIds.filter((id) => id !== tg.keeper_topic_id)

        if (allTopicIds.length > 1) {
          const topicPlaceholders = allTopicIds.map(() => '?').join(',')
          const completedStages = sqlite.prepare(`
            SELECT DISTINCT stage FROM topic_stages
            WHERE topic_id IN (${topicPlaceholders}) AND completed = 1
          `).all(...allTopicIds) as { stage: string }[]

          for (const cs of completedStages) {
            const res = sqlite.prepare(
              'UPDATE topic_stages SET completed = 1 WHERE topic_id = ? AND stage = ? AND completed = 0'
            ).run(tg.keeper_topic_id, cs.stage)
            if (res.changes > 0) progressMerged += res.changes
          }
        }

        sqlite.prepare('UPDATE topics SET section_id = ? WHERE id = ?').run(grp.keeper_id, tg.keeper_topic_id)

        if (nonKeeperTopicIds.length > 0) {
          const delPlaceholders = nonKeeperTopicIds.map(() => '?').join(',')
          const res = sqlite.prepare(`DELETE FROM topics WHERE id IN (${delPlaceholders})`).run(...nonKeeperTopicIds)
          topicsDeleted += res.changes
        }
      }

      const secDelPlaceholders = nonKeeperSectionIds.map(() => '?').join(',')
      const res = sqlite.prepare(`DELETE FROM sections WHERE id IN (${secDelPlaceholders})`).run(...nonKeeperSectionIds)
      sectionsDeleted += res.changes
    }

    console.log(`Processed ${dupGroupsProcessed} duplicate section groups`)
    console.log(`Deleted ${sectionsDeleted} duplicate sections, ${topicsDeleted} duplicate topics`)
    console.log(`Merged ${progressMerged} completed stages from duplicates into keepers`)
  })

  run()

  const after = snapshot()
  console.log('After:', after)

  const sectionDupes = (sqlite.prepare(`
    SELECT COUNT(*) as n FROM (
      SELECT track_id, slug FROM sections GROUP BY track_id, slug HAVING COUNT(*) > 1
    )
  `).get() as Count).n
  const topicDupes = (sqlite.prepare(`
    SELECT COUNT(*) as n FROM (
      SELECT section_id, title FROM topics GROUP BY section_id, title HAVING COUNT(*) > 1
    )
  `).get() as Count).n

  if (sectionDupes > 0) throw new Error(`FAIL: ${sectionDupes} section duplicate groups remain`)
  if (topicDupes > 0) throw new Error(`FAIL: ${topicDupes} topic duplicate groups remain`)
  if (after.completed < before.completed) {
    throw new Error(`FAIL: lost progress ${before.completed} → ${after.completed}`)
  }

  console.log(`OK — dedupe complete. Progress preserved: ${after.completed} completed stages.`)
}

try {
  dedupe()
} finally {
  sqlite.close()
}
