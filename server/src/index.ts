import express, { type RequestHandler } from 'express'
import cookieParser from 'cookie-parser'
import dotenv from "dotenv"
import { getMove } from './api/getMove.ts'
import { getTaggedClaims } from './api/getTaggedClaims.ts'
import { addClaim } from './api/addClaim.ts'
import { deleteStatement } from './api/deleteStatement.ts'
import { editStatement } from './api/editStatement.ts'
import { editArgument } from './api/editArgument.ts'
import { deleteArgument } from './api/deleteArgument.ts'
import { getClaim } from './api/getClaim.ts'
import { getClaimScoreHistory } from './api/getClaimScoreHistory.ts'
import { getArgumentsByClaimId } from './api/getArgumentsByClaimId.ts'
import { getPremisesByArgumentId } from './api/getPremisesByArgumentId.ts'
import { addArgument } from './api/addArgument.ts'
import { addPremise } from './api/addPremise.ts'
import { getConsequence } from './api/getConsequence.ts'
import { reportEntry } from './api/reportEntry.ts'
import { addArgumentMove } from './api/addArgumentMove.ts'
import { addPremiseArgumentMove } from './api/addPremiseArgumentMove.ts'

dotenv.config()
const app = express()
const port = 3001
app.use(express.json())
app.use(cookieParser())


// NOTE: do not leak other owner usernames in responses!

const handlers: Record<string, RequestHandler> = {
  getMove,
  getTaggedClaims,
  addClaim,
  deleteStatement,
  editStatement,
  editArgument,
  deleteArgument,
  getClaim,
  getClaimScoreHistory,
  getArgumentsByClaimId,
  getPremisesByArgumentId,
  addArgument,
  addArgumentMove,
  addPremiseArgumentMove,
  addPremise,
  getConsequence,
  reportEntry,
}

for (const handlerName in handlers) {
  app.post(`/api/${handlerName}`, handlers[handlerName])
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})