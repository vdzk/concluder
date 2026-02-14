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