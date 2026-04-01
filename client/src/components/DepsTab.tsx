import { Show, For, createSignal, type Component } from 'solid-js'
import { A } from '@solidjs/router'
import { ReasoningStepForm } from './ReasoningStepForm'

type Dep = { id: number; question: string; conclusion: string | null }
type FormValues = { question: string; analysis: string; conclusion: string }

type Props = {
  dependents: Dep[] | undefined
  deps: Dep[] | undefined
  onAddDep: (values: FormValues) => Promise<void>
}

export const DepsTab: Component<Props> = (props) => {
  const [showForm, setShowForm] = createSignal(false)

  return (
    <div class="flex flex-col gap-6">
      <Show when={showForm()} fallback={
        <div class="flex flex-col gap-3">
          <ul class="flex flex-col gap-3">
            <For each={props.deps} fallback={<li class="text-gray-400">No sub-questions yet.</li>}>
              {dep => (
                <li>
                  <A
                    href={`/step/${dep.id}`}
                    class="flex flex-col rounded border  px-1.5 py-1
                      border-transparent border-l-black hover:border-black
                    "
                  >
                    <span><strong>Q:</strong> {dep.question}</span>
                    <Show when={dep.conclusion}>
                      <span><strong>A:</strong> {dep.conclusion}</span>
                    </Show>
                  </A>
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
