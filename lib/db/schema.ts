import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const tracks = sqliteTable('tracks', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  slug:      text('slug').notNull().unique(),
  name:      text('name').notNull(),
  icon:      text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const sections = sqliteTable('sections', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  trackId:   integer('track_id').notNull().references(() => tracks.id, { onDelete: 'cascade' }),
  slug:      text('slug').notNull(),
  name:      text('name').notNull(),
  emoji:     text('emoji'),
  color:     text('color'),
  priority:  text('priority'),
  dayRange:  text('day_range'),
  why:       text('why'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const topics = sqliteTable('topics', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  sectionId:  integer('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  title:      text('title').notNull(),
  isCritical: integer('is_critical', { mode: 'boolean' }).notNull().default(false),
  sortOrder:  integer('sort_order').notNull().default(0),
})

export const topicStages = sqliteTable('topic_stages', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  topicId:   integer('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  stage:     text('stage', { enum: ['R', 'W', 'U', 'Rv', 'P'] }).notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('topic_stage_unique').on(table.topicId, table.stage),
])

export type Track = typeof tracks.$inferSelect
export type Section = typeof sections.$inferSelect
export type Topic = typeof topics.$inferSelect
export type TopicStage = typeof topicStages.$inferSelect
export type Stage = 'R' | 'W' | 'U' | 'Rv' | 'P'

export const STAGES: Stage[] = ['R', 'W', 'U', 'Rv', 'P']
export const STAGE_LABELS: Record<Stage, string> = {
  R: 'Read', W: 'Write', U: 'Understand', Rv: 'Revised', P: 'Perfect',
}
export const STAGE_SHORT: Record<Stage, string> = {
  R: 'R', W: 'W', U: 'U', Rv: 'Rv', P: 'P',
}
