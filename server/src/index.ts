import express from 'express'
import { onError, sql } from "./db.ts"
import { cascadeUpdateScores } from './cascadeUpdateScores.ts'
const app = express()
const port = 3001
app.use(express.json())


app.post('/api/getTaggedClaims', async (req, res) => {
  const results = await sql`
    SELECT s.id, s.text, s.likelihood
    FROM statement AS s
    JOIN tagged
      ON tagged.statement_id = s.id
    WHERE tagged.tag = ${req.body.tag}
    ORDER BY s.id
  `.catch(onError)
  res.json(results)
})

app.post('/api/addClaim', async (req, res) => {
  const results = await sql`
    INSERT INTO statement ${sql({
      text: req.body.text
    })}
    RETURNING *
  `.catch(onError)
  const savedId = results[0].id
  await sql`
    INSERT INTO tagged ${sql({
      statement_id: savedId,
      tag: req.body.tag
    })}
  `.catch(onError)

  res.json({ savedId })
})

const getStatementsByIds = (statementIds: number[]) => sql`
  SELECT id, text, likelihood,
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
  const taggedResults = await sql`
    SELECT tag
    FROM tagged
    WHERE statement_id = ${req.body.id}
  `.catch(onError)

  res.json({...results[0], ...taggedResults[0]})
})

app.post('/api/getArgumentsByClaimId', async (req, res) => {
  const results = await sql`
    SELECT id, claim_id, text, pro, strength,
      EXISTS (
        SELECT 1
        FROM premise
        WHERE premise.argument_id = argument.id
      ) AS "hasPremise"
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

  const results = await sql`
    INSERT INTO argument ${sql(req.body)}
    RETURNING id
  `.catch(onError)

  const argumentId = results[0].id

  const scoreChanges = await cascadeUpdateScores(claimId)

  res.json({ savedId: argumentId, scoreChanges })
})

app.post('/api/addPremise', async (req, res) => {
  const statementResults = await sql`
    INSERT INTO statement ${sql({
      text: req.body.text,
      likelihood: req.body.likelihood
    })}
    RETURNING id
  `.catch(onError)

  const statementId = statementResults[0].id

  const premiseResults = await sql`
    INSERT INTO premise ${sql({
      argument_id: req.body.argument_id,
      statement_id: statementId
    })}
    RETURNING id
  `.catch(onError)

  const premiseId = premiseResults[0].id

  const scoreChanges = await cascadeUpdateScores(statementId, true)

  res.json({ savedId: premiseId, scoreChanges })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})