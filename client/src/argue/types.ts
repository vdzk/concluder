export interface Step {
  index: number
  statementId: number
  argumentIndex?: number
  premiseIndex?: number
  isClaim?: boolean
}

export type ScoreDeltas = Record<'statement' | 'argument', Record<number, number>>

export interface ArgumentLocation {
  statementId: number
  argumentIndex: number
}
