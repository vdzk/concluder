export interface Statement {
  id: number
  text: string
  likelihood: number
}

export interface Argument {
  id: number
  text: string
  pro: boolean
  strength: number
}

export interface Comment {
  id: number
  text: string
}

export type EdgeType = 'hasArgument' | 'hasPremise' | 'statementHasComment' | 'argumentHasComment'

export type CardProps = {
  id: number
  mainClaimId: number
  statementsById: Record<number, Statement>
  argumentsById: Record<number, Argument>
  commentsById: Record<number, Comment>
  edges: Record<EdgeType, Record<number, number[]>>
  openChild: Record<string, string | undefined>
  toggleChild: (nodeKey: string, edgeKey: string) => void
}
