export type AnnotationChunk =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; dependencyId: number }
  | { type: 'definition'; text: string; definitionId: number }
