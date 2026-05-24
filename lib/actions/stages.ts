'use server'

import { db } from '@/lib/db'
import { topicStages } from '@/lib/db/schema'
import type { Stage } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function toggleStage(topicId: number, stage: Stage, completed: boolean, trackSlug: string) {
  await db
    .insert(topicStages)
    .values({ topicId, stage, completed })
    .onConflictDoUpdate({
      target: [topicStages.topicId, topicStages.stage],
      set: { completed, updatedAt: new Date().toISOString() },
    })

  revalidatePath(`/${trackSlug}`)
  revalidatePath('/dashboard')
}
