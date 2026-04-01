import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export type AnnotationChunk =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; dependencyId: number }
  | { type: 'definition'; text: string; definitionId: number }

export async function annotateAnalysis(
  question: string,
  analysis: string,
  dependencies: { id: number; question: string }[],
): Promise<AnnotationChunk[]> {
  if (dependencies.length === 0) {
    return [{ type: 'text', text: analysis }]
  }

  const depsDescription = dependencies
    .map(d => `  - id=${d.id}: "${d.question}"`)
    .join('\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are given a reasoning step that answers a question with an analysis text, along with a list of dependency sub-questions. Your task is to break the analysis text into chunks. Each chunk is either plain text or a link to a dependency.

A chunk should be a "link" when that exact span of the analysis text is a statement (or part of a statement) that the dependency's sub-question addresses, investigates, or provides justification for. The reader should be able to click on that highlighted text and be taken to the sub-question that digs deeper into that specific claim.

IMPORTANT RULES:
- The concatenation of all chunk texts must exactly equal the original analysis text, character for character, including all whitespace and punctuation.
- Do not reorder, add, remove, or modify any characters.
- Every character of the analysis must appear in exactly one chunk.
- Only mark a span as a link if a dependency question genuinely targets that specific part.
- A dependency can be linked to multiple spans, or to none.
- Prefer linking meaningful phrases or clauses, not single words.

Question being answered:
"""
${question}
"""

Analysis text:
"""
${analysis}
"""

Dependencies:
${depsDescription}

Respond with a JSON array of chunks. Each chunk is either:
  {"type": "text", "text": "..."} 
  or
  {"type": "link", "text": "...", "dependencyId": <id>}

Respond ONLY with the JSON array, no other text.`,
      },
    ],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return [{ type: 'text', text: analysis }]
  }

  try {
    const chunks = JSON.parse(textBlock.text) as AnnotationChunk[]

    // Validate that concatenation matches original
    const reconstructed = chunks.map(c => c.text).join('')
    if (reconstructed !== analysis) {
      return [{ type: 'text', text: analysis }]
    }

    return chunks
  } catch {
    return [{ type: 'text', text: analysis }]
  }
}
