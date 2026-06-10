import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import {
  tracks, sections, topics, companies, topicCompanies,
  DSA_COMPANIES_TRACK_SLUG,
} from './schema'
import type { Difficulty } from './schema'

const REPO = 'liquidslr/interview-company-wise-problems'
const BRANCH = 'main'
const CSV_FILE = '5. All.csv'
const CONCURRENCY = 8

const sqlite = new Database(process.env.DATABASE_URL ?? './data/prep.db')
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
const db = drizzle(sqlite)

type ProblemRow = {
  difficulty: Difficulty
  title: string
  url: string
  frequency: number
  company: string
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') { inQuotes = false }
      else { field += c }
    } else {
      if (c === '"') { inQuotes = true }
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (c === '\r') { /* skip */ }
      else { field += c }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows
}

async function listCompanyFolders(): Promise<string[]> {
  const url = `https://api.github.com/repos/${REPO}/contents?ref=${BRANCH}`
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`)
  const items = await res.json() as Array<{ name: string; type: string }>
  return items.filter((x) => x.type === 'dir').map((x) => x.name)
}

async function fetchCompanyCsv(company: string): Promise<ProblemRow[]> {
  const path = `${encodeURIComponent(company)}/${encodeURIComponent(CSV_FILE)}`
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`
  const res = await fetch(url)
  if (!res.ok) return []
  const text = await res.text()
  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const [header, ...data] = rows
  const idx = {
    diff: header.indexOf('Difficulty'),
    title: header.indexOf('Title'),
    freq: header.indexOf('Frequency'),
    link: header.indexOf('Link'),
  }
  if (idx.diff < 0 || idx.title < 0 || idx.link < 0) return []

  const out: ProblemRow[] = []
  for (const r of data) {
    const diff = (r[idx.diff] ?? '').trim().toUpperCase()
    const title = (r[idx.title] ?? '').trim()
    const link = (r[idx.link] ?? '').trim()
    if (!title || !link) continue
    if (diff !== 'EASY' && diff !== 'MEDIUM' && diff !== 'HARD') continue
    const freq = parseFloat(r[idx.freq] ?? '0') || 0
    out.push({ difficulty: diff as Difficulty, title, url: link, frequency: freq, company })
  }
  return out
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (true) {
      const i = cursor++
      if (i >= items.length) return
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

async function main() {
  console.log(`Fetching company folder list from ${REPO}...`)
  const companyNames = await listCompanyFolders()
  console.log(`Found ${companyNames.length} companies. Downloading "${CSV_FILE}" for each (concurrency ${CONCURRENCY})...`)

  let companiesWithData = 0
  let totalRows = 0
  const allRows: ProblemRow[] = []

  await mapWithConcurrency(companyNames, CONCURRENCY, async (company, i) => {
    const rows = await fetchCompanyCsv(company)
    if (rows.length > 0) {
      companiesWithData++
      totalRows += rows.length
      allRows.push(...rows)
    }
    if ((i + 1) % 25 === 0 || i + 1 === companyNames.length) {
      console.log(`  ${i + 1}/${companyNames.length} fetched · ${totalRows} rows so far`)
    }
  })

  console.log(`Fetched ${totalRows} rows across ${companiesWithData} companies. Aggregating...`)

  type Aggregated = { title: string; difficulty: Difficulty; companies: Map<string, number> }
  const byUrl = new Map<string, Aggregated>()
  for (const r of allRows) {
    let agg = byUrl.get(r.url)
    if (!agg) {
      agg = { title: r.title, difficulty: r.difficulty, companies: new Map() }
      byUrl.set(r.url, agg)
    }
    const prev = agg.companies.get(r.company) ?? 0
    if (r.frequency > prev) agg.companies.set(r.company, r.frequency)
  }
  console.log(`Unique problems: ${byUrl.size}`)

  console.log('Writing to DB...')

  // Track
  db.insert(tracks).values({
    slug: DSA_COMPANIES_TRACK_SLUG,
    name: 'DSA — Company Asked',
    icon: '🏢',
    sortOrder: 100,
  }).onConflictDoUpdate({
    target: tracks.slug,
    set: { name: 'DSA — Company Asked', icon: '🏢', sortOrder: 100 },
  }).run()
  const [track] = db.select().from(tracks).where(eq(tracks.slug, DSA_COMPANIES_TRACK_SLUG)).all()

  // Sections (Easy/Medium/Hard)
  const sectionDefs: { difficulty: Difficulty; slug: string; name: string; emoji: string; color: string; sortOrder: number }[] = [
    { difficulty: 'EASY',   slug: 'easy',   name: 'Easy',   emoji: '🟢', color: '#66D19E', sortOrder: 1 },
    { difficulty: 'MEDIUM', slug: 'medium', name: 'Medium', emoji: '🟡', color: '#FFD479', sortOrder: 2 },
    { difficulty: 'HARD',   slug: 'hard',   name: 'Hard',   emoji: '🔴', color: '#FF6B6B', sortOrder: 3 },
  ]
  const sectionIdByDiff: Record<Difficulty, number> = { EASY: 0, MEDIUM: 0, HARD: 0 }
  for (const s of sectionDefs) {
    db.insert(sections).values({
      trackId: track.id, slug: s.slug, name: s.name, emoji: s.emoji, color: s.color,
      priority: s.name.toUpperCase(), sortOrder: s.sortOrder,
    }).onConflictDoUpdate({
      target: [sections.trackId, sections.slug],
      set: { name: s.name, emoji: s.emoji, color: s.color, priority: s.name.toUpperCase(), sortOrder: s.sortOrder },
    }).run()
    const [row] = db.select().from(sections).where(eq(sections.slug, s.slug)).all()
    sectionIdByDiff[s.difficulty] = row.id
  }

  // Companies
  const allCompanyNames = Array.from(new Set(allRows.map((r) => r.company))).sort()
  const companyIdByName = new Map<string, number>()
  db.transaction((tx) => {
    for (const name of allCompanyNames) {
      const slug = slugify(name)
      tx.insert(companies).values({ slug, name }).onConflictDoUpdate({
        target: companies.slug,
        set: { name },
      }).run()
    }
  })
  for (const row of db.select().from(companies).all()) {
    companyIdByName.set(row.name, row.id)
  }
  console.log(`Upserted ${allCompanyNames.length} companies`)

  // Topics + topicCompanies — batch in a transaction
  const urls = Array.from(byUrl.keys())
  console.log(`Upserting ${urls.length} topics + their company links...`)
  let topicsDone = 0
  const BATCH = 500
  for (let start = 0; start < urls.length; start += BATCH) {
    const slice = urls.slice(start, start + BATCH)
    db.transaction((tx) => {
      for (const url of slice) {
        const agg = byUrl.get(url)!
        const sectionId = sectionIdByDiff[agg.difficulty]
        tx.insert(topics).values({
          sectionId,
          title: agg.title,
          url,
          difficulty: agg.difficulty,
          isCritical: false,
        }).onConflictDoUpdate({
          target: [topics.sectionId, topics.url],
          set: { title: agg.title, difficulty: agg.difficulty },
        }).run()
      }
    })
    topicsDone += slice.length
    console.log(`  topics: ${topicsDone}/${urls.length}`)
  }

  // Build topicId map
  const topicIdByUrl = new Map<string, number>()
  for (const row of db.select({ id: topics.id, url: topics.url }).from(topics).all()) {
    if (row.url) topicIdByUrl.set(row.url, row.id)
  }

  // topicCompanies links
  let linksDone = 0
  const allLinks: { topicId: number; companyId: number; frequency: number }[] = []
  for (const [url, agg] of byUrl) {
    const topicId = topicIdByUrl.get(url)
    if (!topicId) continue
    for (const [companyName, freq] of agg.companies) {
      const companyId = companyIdByName.get(companyName)
      if (!companyId) continue
      allLinks.push({ topicId, companyId, frequency: freq })
    }
  }
  console.log(`Upserting ${allLinks.length} topic_company links...`)
  for (let start = 0; start < allLinks.length; start += BATCH) {
    const slice = allLinks.slice(start, start + BATCH)
    db.transaction((tx) => {
      for (const link of slice) {
        tx.insert(topicCompanies).values(link).onConflictDoUpdate({
          target: [topicCompanies.topicId, topicCompanies.companyId],
          set: { frequency: link.frequency },
        }).run()
      }
    })
    linksDone += slice.length
    if (linksDone % 5000 < BATCH) console.log(`  links: ${linksDone}/${allLinks.length}`)
  }

  console.log('Done.')
  console.log(`  Companies: ${allCompanyNames.length}`)
  console.log(`  Topics:    ${urls.length}`)
  console.log(`  Links:     ${allLinks.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
