import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { featuredTable } from '../../db/schema.ts'
import { generateFeaturedConclusion } from '../../lib/generateFeaturedConclusion.ts'

export async function updateFeaturedConclusion(stepId: number, question: string, conclusion: string) {
  const [featured] = await db.select().from(featuredTable).where(eq(featuredTable.id, stepId)).limit(1)
  if (!featured) return

  const newConclusion = await generateFeaturedConclusion(question, conclusion, featured.conclusion)

  await db.update(featuredTable).set({
    conclusion: newConclusion ?? featured.conclusion,
  }).where(eq(featuredTable.id, stepId))
}
