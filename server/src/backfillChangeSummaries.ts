import 'dotenv/config'
import { eq, asc, desc, isNull } from 'drizzle-orm'
import { db } from './db/index.ts'
import { reasoningStepTable, reasoningStepVersionTable } from './db/schema.ts'
import { generateChangeSummary } from './lib/generateChangeSummary.ts'

const force = process.argv.includes('--force')

async function main() {
  // --- Backfill reasoning_step (current rows) ---
  const steps = await db
    .select()
    .from(reasoningStepTable)
    .where(force ? undefined : isNull(reasoningStepTable.changeSummary))

  console.log(`Found ${steps.length} reasoning steps to backfill.${force ? ' (--force)' : ''}`)

  for (const step of steps) {
    // Find the latest version to diff against (if any)
    const [latestVersion] = await db
      .select()
      .from(reasoningStepVersionTable)
      .where(eq(reasoningStepVersionTable.reasoningStepId, step.id))
      .orderBy(desc(reasoningStepVersionTable.version))
      .limit(1)

    const oldFields = latestVersion
      ? { question: latestVersion.question, analysis: latestVersion.analysis, conclusion: latestVersion.conclusion }
      : null

    console.log(`[step ${step.id}] Generating summary for: "${step.question}"${oldFields ? ' (diff)' : ' (new)'}`)
    let summary: string | null
    try {
      summary = await generateChangeSummary(
        { question: step.question, analysis: step.analysis, conclusion: step.conclusion },
        oldFields,
      )
    } catch (err) {
      console.error(`[step ${step.id}] Error, skipping:`, (err as Error).message)
      continue
    }

    if (!summary) {
      console.log(`[step ${step.id}] REJECTED, skipping.`)
      continue
    }

    await db.update(reasoningStepTable).set({ changeSummary: summary }).where(eq(reasoningStepTable.id, step.id))
    console.log(`[step ${step.id}] Done: "${summary}"`)
  }

  // --- Backfill reasoning_step_version rows ---
  const versions = await db
    .select()
    .from(reasoningStepVersionTable)
    .where(force ? undefined : isNull(reasoningStepVersionTable.changeSummary))
    .orderBy(asc(reasoningStepVersionTable.reasoningStepId), asc(reasoningStepVersionTable.version))

  console.log(`Found ${versions.length} version rows to backfill.`)

  let prevByStep: Record<number, { question: string; analysis: string; conclusion: string }> = {}

  for (const ver of versions) {
    const prev = prevByStep[ver.reasoningStepId] ?? null

    console.log(`[version ${ver.id}, step ${ver.reasoningStepId}, v${ver.version}] Generating summary...`)
    let summary: string | null
    try {
      summary = await generateChangeSummary(
        { question: ver.question, analysis: ver.analysis, conclusion: ver.conclusion },
        prev,
      )
    } catch (err) {
      console.error(`[version ${ver.id}] Error, skipping:`, (err as Error).message)
      prevByStep[ver.reasoningStepId] = {
        question: ver.question,
        analysis: ver.analysis,
        conclusion: ver.conclusion,
      }
      continue
    }

    if (!summary) {
      console.log(`[version ${ver.id}] REJECTED, skipping.`)
    } else {
      await db.update(reasoningStepVersionTable).set({ changeSummary: summary }).where(eq(reasoningStepVersionTable.id, ver.id))
      console.log(`[version ${ver.id}] Done: "${summary}"`)
    }

    prevByStep[ver.reasoningStepId] = {
      question: ver.question,
      analysis: ver.analysis,
      conclusion: ver.conclusion,
    }
  }

  console.log('All done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
