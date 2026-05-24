import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

type DbType = ReturnType<typeof drizzle<typeof schema>>

const globalForDb = globalThis as unknown as { _db: DbType | undefined }

function createDb(): DbType {
  const sqlite = new Database(process.env.DATABASE_URL ?? './data/prep.db')
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  return drizzle(sqlite, { schema })
}

export const db: DbType = globalForDb._db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
  globalForDb._db = db
}
