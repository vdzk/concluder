import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from './db/index.ts'
import { featuredTable, reasoningStepTable } from './db/schema.ts'
import { generateFeaturedConclusion } from './lib/generateFeaturedConclusion.ts'

async function main() {
  const rows = await db
    .select({
      id: featuredTable.id,
      question: reasoningStepTable.question,
      conclusion: reasoningStepTable.conclusion,
      featuredConclusion: featuredTable.conclusion,
    })
    .from(featuredTable)
    .innerJoin(reasoningStepTable, eq(reasoningStepTable.id, featuredTable.id))

  console.log(`Found ${rows.length} featured rows to process.`)

  for (const row of rows) {
    if (row.featuredConclusion) {
      console.log(`[${row.id}] Already has conclusion, skipping.`)
      continue
    }

    console.log(`[${row.id}] Generating conclusion for: "${row.question}"`)
    const generated = await generateFeaturedConclusion(row.question, row.conclusion, null)

    if (!generated) {
      console.log(`[${row.id}] REJECTED by LLM, skipping.`)
      continue
    }

    await db.update(featuredTable).set({ conclusion: generated }).where(eq(featuredTable.id, row.id))
    console.log(`[${row.id}] Done: "${generated}"`)
  }

  console.log('All done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
