import { Show, For, createSignal, type Component } from 'solid-js'
import { ReasoningStepForm } from './ReasoningStepForm'
import { BlockItem } from './ui/BlockItem'
import type { TextSelection } from './StepContent'
import { Button } from './ui/Button'
import { EmptyState } from './ui/EmptyState'

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
            <p class="text-sm text-gray-500 dark:text-gray-400 italic">
              Select a part of the analysis text to link it to one of the questions.
            </p>
          }>
            {sel => (
              <div class="flex items-center gap-2">
                <p class="flex-1 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-2 py-1">
                  Selected: "{sel().text.length > 80 ? sel().text.slice(0, 80) + '…' : sel().text}"
                </p>
                <Show when={getLinkedDepAtSelection(props.annotatedAnalysis, sel()) !== null}>
                  <Button
                    variant="badge"
                    color="red"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => props.onRemoveLink()}
                  >
                    Remove link
                  </Button>
                </Show>
              </div>
            )}
          </Show>
          <ul class="flex flex-col gap-2">
            <For each={props.deps} fallback={<EmptyState as="li" message="No sub-questions yet." />}>
              {dep => (
                <li class="flex items-start gap-2">
                  <BlockItem href={`/step/${dep.id}`} class="flex flex-col flex-1">
                    <span><strong>Q:</strong> {dep.question}</span>
                    <Show when={dep.conclusion}>
                      <span><strong>A:</strong> {dep.conclusion}</span>
                    </Show>
                  </BlockItem>
                  <Show when={props.selection}>
                    <Button
                      variant="badge"
                      color="green"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => props.onLink(dep.id)}
                    >
                      Link
                    </Button>
                  </Show>
                </li>
              )}
            </For>
          </ul>
          <Button variant="secondary" size="sm" class="self-start" onClick={() => setShowForm(true)}>
            + Add sub-question
          </Button>
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
