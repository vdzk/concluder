import { type AnnotationChunk } from '../../lib/annotateAnalysis.ts'

export type LinkInfo = { dependencyId: number; startOffset: number; endOffset: number }

export function extractLinks(chunks: AnnotationChunk[]): LinkInfo[] {
  const links: LinkInfo[] = [];
  let offset = 0;
  for (const chunk of chunks) {
    if (chunk.type === 'link') {
      links.push({ dependencyId: chunk.dependencyId, startOffset: offset, endOffset: offset + chunk.text.length });
    }
    offset += chunk.text.length;
  }
  return links;
}

export function buildChunksFromLinks(analysis: string, links: LinkInfo[]): AnnotationChunk[] {
  const sorted = [...links].sort((a, b) => a.startOffset - b.startOffset);
  const chunks: AnnotationChunk[] = [];
  let pos = 0;
  for (const link of sorted) {
    if (link.startOffset > pos) {
      chunks.push({ type: 'text', text: analysis.slice(pos, link.startOffset) });
    }
    chunks.push({ type: 'link', text: analysis.slice(link.startOffset, link.endOffset), dependencyId: link.dependencyId });
    pos = link.endOffset;
  }
  if (pos < analysis.length) {
    chunks.push({ type: 'text', text: analysis.slice(pos) });
  }
  return chunks;
}

export function stripDefinitions(chunks: AnnotationChunk[]): AnnotationChunk[] {
  const result: AnnotationChunk[] = [];
  for (const chunk of chunks) {
    if (chunk.type === 'definition' || chunk.type === 'text') {
      const last = result[result.length - 1];
      if (last && last.type === 'text') {
        last.text += chunk.text;
      } else {
        result.push({ type: 'text', text: chunk.text });
      }
    } else {
      result.push({ ...chunk });
    }
  }
  return result;
}

export function preserveLinks(oldAnalysis: string, newAnalysis: string, oldChunks: AnnotationChunk[]): AnnotationChunk[] {
  const oldLinks = extractLinks(oldChunks);
  const newLinks: LinkInfo[] = [];
  const usedRanges: [number, number][] = [];

  for (const link of oldLinks) {
    const linkText = oldAnalysis.slice(link.startOffset, link.endOffset);
    let pos = 0;
    while (pos < newAnalysis.length) {
      const idx = newAnalysis.indexOf(linkText, pos);
      if (idx === -1) break;
      const end = idx + linkText.length;
      const overlaps = usedRanges.some(([s, e]) => idx < e && end > s);
      if (!overlaps) {
        newLinks.push({ dependencyId: link.dependencyId, startOffset: idx, endOffset: end });
        usedRanges.push([idx, end]);
        break;
      }
      pos = idx + 1;
    }
  }

  return buildChunksFromLinks(newAnalysis, newLinks);
}

export function addLinkToChunks(existingLinks: LinkInfo[], newLink: LinkInfo): LinkInfo[] {
  const result: LinkInfo[] = [];
  for (const link of existingLinks) {
    if (link.endOffset <= newLink.startOffset || link.startOffset >= newLink.endOffset) {
      result.push(link);
    } else if (link.startOffset < newLink.startOffset && link.endOffset > newLink.endOffset) {
      result.push({ ...link, endOffset: newLink.startOffset });
      result.push({ ...link, startOffset: newLink.endOffset });
    } else if (link.startOffset < newLink.startOffset) {
      result.push({ ...link, endOffset: newLink.startOffset });
    } else if (link.endOffset > newLink.endOffset) {
      result.push({ ...link, startOffset: newLink.endOffset });
    }
  }
  result.push(newLink);
  return result;
}

export function removeLinkAtSelection(links: LinkInfo[], startOffset: number, endOffset: number): LinkInfo[] {
  return links.filter(link => link.endOffset <= startOffset || link.startOffset >= endOffset);
}
