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
  type: 'addClaim' | 'addArgument'
  statement_id: number | null
  argument_id: number | null
  target_id: number | null
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