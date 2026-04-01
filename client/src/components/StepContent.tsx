import { type Component } from 'solid-js'
import { A } from '@solidjs/router'

type AnnotationChunk =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; dependencyId: number }
  | { type: 'definition'; text: string; definitionId: number }

type Props = {
  question: string
  analysis: string
  annotatedAnalysis: unknown
  conclusion: string
}

export const StepContent: Component<Props> = (props) => {
  return (
    <>
      <h1 class="text-2xl font-semibold">{props.question}</h1>
      <section>
        <h2 class="text-sm font-medium uppercase tracking-wide text-gray-500 mb-1">Analysis</h2>
        <p class="text-gray-800 whitespace-pre-line">
          {(() => {
            const chunks = props.annotatedAnalysis as AnnotationChunk[] | null;
            if (!chunks || !Array.isArray(chunks)) return props.analysis;
            return chunks.map(chunk =>
              chunk.type === 'link' ? (
                <A
                  href={`/step/${chunk.dependencyId}`}
                  class="underline decoration-green-400 decoration-2 text-green-800 hover:bg-green-50 rounded px-0.5"
                >
                  {chunk.text}
                </A>
              ) : chunk.type === 'definition' ? (
                <A
                  href={`/definition/${chunk.definitionId}`}
                  class="underline decoration-amber-400 decoration-2 text-amber-800 hover:bg-amber-50 rounded px-0.5"
                >
                  {chunk.text}
                </A>
              ) : chunk.text
            );
          })()}
        </p>
      </section>
      <section>
        <h2 class="text-sm font-medium uppercase tracking-wide text-gray-500 mb-1">Conclusion</h2>
        <p class="text-gray-800">{props.conclusion}</p>
      </section>
    </>
  );
}
