import { Show, For, createSignal, type Component } from 'solid-js'
import { A } from '@solidjs/router'
import { ReasoningStepForm } from './ReasoningStepForm'
import type { TextSelection } from './StepContent'

type Dep = { id: number; question: string; conclusion: string | null }
type FormValues = { question: string; analysis: string; conclusion: string }

type Props = {
  dependents: Dep[] | undefined
  deps: Dep[] | undefined
  onAddDep: (values: FormValues) => Promise<void>
  selection: TextSelection | null
  onLink: (depId: number) => void
  annotatedAnalysis: unknown
  onRemoveLink: () => void
}

function getLinkedDepAtSelection(annotatedAnalysis: unknown, sel: TextSelection): number | null {
  const chunks = annotatedAnalysis as Array<{ type: string; text: string; dependencyId?: number }> | null
  if (!chunks || !Array.isArray(chunks)) return null
  let offset = 0
  for (const chunk of chunks) {
    const chunkEnd = offset + chunk.text.length
    if (chunk.type === 'link' && chunk.dependencyId !== undefined) {
      if (sel.start < chunkEnd && sel.end > offset) return chunk.dependencyId
    }
    offset = chunkEnd
  }
  return null
}

export const DepsTab: Component<Props> = (props) => {
  const [showForm, setShowForm] = createSignal(false)

  return (
    <div class="flex flex-col gap-6">
      <Show when={showForm()} fallback={
        <div class="flex flex-col gap-3">
          <Show when={props.selection} fallback={
            <p class="text-sm text-gray-500 italic">
              Select a part of the analysis text to link it to one of the questions.
            </p>
          }>
            {sel => (
              <div class="flex items-center gap-2">
                <p class="flex-1 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
                  Selected: "{sel().text.length > 80 ? sel().text.slice(0, 80) + '…' : sel().text}"
                </p>
                <Show when={getLinkedDepAtSelection(props.annotatedAnalysis, sel()) !== null}>
                  <button
                    class="shrink-0 px-2 py-1 text-xs rounded bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => props.onRemoveLink()}
                  >
                    Remove link
                  </button>
                </Show>
              </div>
            )}
          </Show>
          <ul class="flex flex-col gap-3">
            <For each={props.deps} fallback={<li class="text-gray-400">No sub-questions yet.</li>}>
              {dep => (
                <li class="flex items-start gap-2">
                  <A
                    href={`/step/${dep.id}`}
                    class="flex flex-col flex-1 rounded border px-1.5 py-1
                      border-transparent border-l-black hover:border-black
                    "
                  >
                    <span><strong>Q:</strong> {dep.question}</span>
                    <Show when={dep.conclusion}>
                      <span><strong>A:</strong> {dep.conclusion}</span>
                    </Show>
                  </A>
                  <Show when={props.selection}>
                    <button
                      class="shrink-0 px-2 py-1 text-xs rounded bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 cursor-pointer"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => props.onLink(dep.id)}
                    >
                      Link
                    </button>
                  </Show>
                </li>
              )}
            </For>
          </ul>
          <button
            class="self-start px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            + Add sub-question
          </button>
        </div>
      }>
        <ReasoningStepForm
          submitLabel="Create sub-question"
          onSubmit={async (values) => {
            await props.onAddDep(values)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      </Show>
    </div>
  )
}
