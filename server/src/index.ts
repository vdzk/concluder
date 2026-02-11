import express from 'express'
import { onError, sql } from "./db.ts"
import { analyseArgument } from './analyseArgument.ts'
import { cascadeUpdateScores } from './cascadeUpdateScores.ts'
const app = express()
const port = 3001
app.use(express.json())

app.post('/api/addClaim', async (req, res) => {
  const results = await sql`
    INSERT INTO statement ${sql(req.body)}
    RETURNING *
  `.catch(onError)
  res.json({ savedId: results[0].id })
})

const getStatementsByIds = (statementIds: number[]) => sql`
  SELECT id, text, likelihood, justification,
    EXISTS (
      SELECT 1
      FROM argument
      WHERE argument.claim_id = statement.id
    ) AS "hasArgument"
  FROM statement
  WHERE id IN ${sql(statementIds)}
`.catch(onError)

app.post('/api/getClaim', async (req, res) => {
  const results = await getStatementsByIds([req.body.id])
  res.json(results[0])
})

app.post('/api/getArgumentsByClaimId', async (req, res) => {
  const results = await sql`
    SELECT id, claim_id, text, pro, strength
    FROM argument
    WHERE claim_id = ${req.body.claimId}
  `.catch(onError)
  res.json(results)
})

app.post('/api/getPremisesByArgumentId', async (req, res) => {
  const premises = await sql`
    SELECT id, argument_id, statement_id, invert
    FROM premise
    WHERE argument_id = ${req.body.argumentId}
  `.catch(onError)
  const statementIds = premises.map(premise => premise.statement_id)
  const statements = await getStatementsByIds(statementIds)
  res.json({ premises, statements })
})

app.post('/api/addArgument', async (req, res) => {
  const claimId = req.body.claim_id
  const claims = await sql`
    SELECT id, text
    FROM statement
    WHERE id = ${claimId}
  `.catch(onError)

  const analysis = await analyseArgument(claims[0].text, req.body.text)

  if (!analysis) {
    res.sendStatus(500).json({
      error: 'Argument analysis failed'
    })
    return
  }

  const strength = analysis.premises.reduce(
    (acc, premise) => acc * premise.likelihood,
    1
  )

  const results = await sql`
    INSERT INTO argument ${sql({
    ...req.body,
    pro: analysis.pro,
    strength
  })}
    RETURNING id
  `.catch(onError)

  const argumentId = results[0].id

  const statements = await sql`
    INSERT INTO statement
    ${sql(analysis.premises, 'text', 'justification', 'likelihood')}
    RETURNING id
  `.catch(onError)

  const premises = statements.map(statement => ({
    argument_id: argumentId,
    statement_id: statement.id,
    // TODO: if there will be automatic deduplication, a new premise may turn out to be an inverse of an existing statement
    invert: false
  }))
  await sql`INSERT INTO premise ${sql(premises)}`

  const scoreChanges = await cascadeUpdateScores(claimId)

  res.json({ savedId: argumentId, scoreChanges })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})