import { Show, For, type Component } from 'solid-js'
import { A } from '@solidjs/router'

type Dep = { id: number; question: string; conclusion: string | null }

type Props = {
  dependents: Dep[] | undefined
  deps: Dep[] | undefined
}

export const DepsTab: Component<Props> = (props) => {
  return (
    <div class="flex flex-col gap-6">
      <Show when={(props.dependents?.length ?? 0) > 0}>
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Depended on by</h3>
          <ul class="flex flex-col gap-1">
            <For each={props.dependents}>
              {dep => (
                <li class="flex flex-col">
                  <A href={`/step/${dep.id}`} class="text-green-700 hover:underline text-sm">
                    {dep.question}
                  </A>
                  <Show when={dep.conclusion}>
                    <span class="text-sm text-gray-600">{dep.conclusion}</span>
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
      <div>
        <h3 class="text-sm font-medium text-gray-500 mb-2">Depends on</h3>
        <ul class="flex flex-col gap-1">
          <For each={props.deps} fallback={<li class="text-sm text-gray-400">No dependencies yet.</li>}>
            {dep => (
              <li class="flex flex-col">
                <A href={`/step/${dep.id}`} class="text-green-700 hover:underline text-sm">
                  {dep.question}
                </A>
                <Show when={dep.conclusion}>
                  <span class="text-sm text-gray-600">{dep.conclusion}</span>
                </Show>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  )
}
