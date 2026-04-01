import { db } from '../../db/index.ts'
import { definitionTable } from '../../db/schema.ts'
import { type AnnotationChunk } from '../../lib/annotateAnalysis.ts'

export async function applyDefinitions(chunks: AnnotationChunk[]): Promise<AnnotationChunk[]> {
  const definitions = await db.select({ id: definitionTable.id, term: definitionTable.term }).from(definitionTable);
  return annotateDefinitions(chunks, definitions);
}

/**
 * Finds the first case-insensitive occurrence of each definition term in the chunks
 * and inserts a definition annotation. If the term falls inside a dependency link chunk,
 * the link is split so the definition portion gets its own chunk while the surrounding
 * text retains the original link.
 */
export function annotateDefinitions(
  chunks: AnnotationChunk[],
  definitions: { id: number; term: string }[],
): AnnotationChunk[] {
  if (definitions.length === 0) return chunks;

  // Sort definitions longest-first so longer terms match before shorter substrings
  const sorted = [...definitions].sort((a, b) => b.term.length - a.term.length);
  const matched = new Set<number>();
  let result = [...chunks];

  for (const def of sorted) {
    // Build the full text to find the first occurrence across all chunks
    let offset = 0;
    let foundIdx = -1;
    let foundOffset = -1;

    const termLower = def.term.toLowerCase();

    for (let i = 0; i < result.length; i++) {
      const chunk = result[i];
      // Only search in text and link chunks (not already-placed definitions)
      if (chunk.type === 'definition') {
        offset += chunk.text.length;
        continue;
      }
      const idx = chunk.text.toLowerCase().indexOf(termLower);
      if (idx !== -1) {
        foundIdx = i;
        foundOffset = idx;
        break;
      }
      offset += chunk.text.length;
    }

    if (foundIdx === -1) continue;
    matched.add(def.id);

    const chunk = result[foundIdx];
    const matchEnd = foundOffset + def.term.length;
    const matchedText = chunk.text.slice(foundOffset, matchEnd);

    const replacement: AnnotationChunk[] = [];

    if (foundOffset > 0) {
      if (chunk.type === 'link') {
        replacement.push({ type: 'link', text: chunk.text.slice(0, foundOffset), dependencyId: chunk.dependencyId });
      } else {
        replacement.push({ type: 'text', text: chunk.text.slice(0, foundOffset) });
      }
    }

    replacement.push({ type: 'definition', text: matchedText, definitionId: def.id });

    if (matchEnd < chunk.text.length) {
      if (chunk.type === 'link') {
        replacement.push({ type: 'link', text: chunk.text.slice(matchEnd), dependencyId: chunk.dependencyId });
      } else {
        replacement.push({ type: 'text', text: chunk.text.slice(matchEnd) });
      }
    }

    result.splice(foundIdx, 1, ...replacement);
  }

  return result;
}
