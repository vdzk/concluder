export type ScoreChanges = Record<
  "statement" | "argument",
  Record<number, { old: number; new: number;}>
>