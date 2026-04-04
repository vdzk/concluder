import { type Component, type JSX, onCleanup } from 'solid-js'
import { InlineLink } from './ui/InlineLink'
import { SectionHeading } from './ui/SectionHeading'

const URL_RE = /https?:\/\/[^\s<>"]+/g;

function trimUrl(raw: string): string {
  let url = raw.replace(/[.,;:!?]+$/, '');
  while (url.endsWith(')') && (url.match(/\(/g)?.length ?? 0) < (url.match(/\)/g)?.length ?? 0)) {
    url = url.slice(0, -1);
  }
  while (url.endsWith(']') && (url.match(/\[/g)?.length ?? 0) < (url.match(/\]/g)?.length ?? 0)) {
    url = url.slice(0, -1);
  }
  return url;
}

function renderText(text: string): string | JSX.Element[] {
  const parts: JSX.Element[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    const url = trimUrl(m[0]);
    parts.push(<InlineLink variant="external" href={url}>{url}</InlineLink>);
    last = m.index! + url.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 1 ? parts : text;
}

type AnnotationChunk =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; dependencyId: number }
  | { type: 'definition'; text: string; definitionId: number }

export type TextSelection = { start: number; end: number; text: string }

type Props = {
  question: string
  analysis: string
  annotatedAnalysis: unknown
  conclusion: string
  onSelectionChange?: (selection: TextSelection | null) => void
}

export const StepContent: Component<Props> = (props) => {
  let analysisRef: HTMLParagraphElement | undefined;

  const handleMouseUp = () => {
    if (!props.onSelectionChange || !analysisRef) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      props.onSelectionChange(null);
      return;
    }

    const range = sel.getRangeAt(0);
    if (!analysisRef.contains(range.startContainer) || !analysisRef.contains(range.endContainer)) {
      props.onSelectionChange(null);
      return;
    }

    const preRange = document.createRange();
    preRange.selectNodeContents(analysisRef);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;
    const end = start + range.toString().length;

    if (start === end) {
      props.onSelectionChange(null);
      return;
    }

    props.onSelectionChange({ start, end, text: range.toString() });
  };

  document.addEventListener('mouseup', handleMouseUp);
  onCleanup(() => document.removeEventListener('mouseup', handleMouseUp));

  return (
    <>
      <h1 class="text-2xl font-semibold">{props.question}</h1>
      <section>
        <SectionHeading>Analysis</SectionHeading>
        <p ref={analysisRef} class="text-gray-800 dark:text-gray-200 whitespace-pre-line">
          {(() => {
            const chunks = props.annotatedAnalysis as AnnotationChunk[] | null;
            if (!chunks || !Array.isArray(chunks)) return props.analysis;
            return chunks.map(chunk =>
              chunk.type === 'link' ? (
                <InlineLink variant="dep" href={`/step/${chunk.dependencyId}`}>{chunk.text}</InlineLink>
              ) : chunk.type === 'definition' ? (
                <InlineLink variant="def" href={`/definition/${chunk.definitionId}`}>{chunk.text}</InlineLink>
              ) : renderText(chunk.text)
            );
          })()}
        </p>
      </section>
      <section>
        <SectionHeading>Conclusion</SectionHeading>
        <p class="text-gray-800 dark:text-gray-200">{renderText(props.conclusion)}</p>
      </section>
    </>
  );
}
