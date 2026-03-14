export type ScoreChanges = Record<
  "statement" | "argument",
  Record<number, { old: number; new: number;}>
>


export interface ArgumentFormData {
  pro: boolean
  strength: number
  text: string 
}

export interface PremiseFormData {
  likelihood: number
  text: string 
}

export interface MoveRecord {
  id: number
  claim_id: number
  type: 'addClaim' | 'addArgument' | 'addPremiseArgument' | 'addHiddenPremise'
  argument_id: number | null
  premise_id: number | null
  avatar_id: number
}

export interface StatementRecord {
  id: number,
  text: string,
  likelihood: number,
}

export interface ArgumentRecord {
  id: number
  claim_id: number
  text: string
  pro: boolean
  strength: number
}

export interface AvatarRecord {
  id: number
  svg: string
  display_name: string
}

export interface GetMoveResponse {
  move: {
    id: number
    claim_id: number
    type: MoveRecord['type']
    argument_id: number | null
    premise_id: number | null
    owner: string
  }
  claimStatement: StatementRecord
  statement: StatementRecord
  argument: ArgumentRecord
  avatar: AvatarRecord
  targetStatement: StatementRecord | null
  targetArgument: ArgumentRecord | null
  targetArgumentClaim: StatementRecord | null
  premiseStatement: StatementRecord | null
  nav: {
    current: number
    total: number
    prevMoveId: number | null
    nextMoveId: number | null
    firstMoveId: number | null
    lastMoveId: number | null
  }
}