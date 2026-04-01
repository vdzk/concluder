import { Show, For, type Component } from 'solid-js'
import { A } from '@solidjs/router'
import type { Version } from '../pages/ReasoningStepPage'
import { VersionHistoryItem } from './VersionHistoryItem'

type Dep = { id: number; question: string }

type Props = {
  open: boolean
  onClose: () => void
  createdByName: string | undefined
  editing: boolean
  onEdit: () => void
  dependents: Dep[] | undefined
  deps: Dep[] | undefined
  showDeps: boolean
  onToggleDeps: () => void
  onAddDep: () => void
  versions: Version[] | undefined
  showHistory: boolean
  onToggleHistory: () => void
  previewVersionId: number | null
  onTogglePreview: (id: number) => void
  onRestore: (id: number) => void
  rollingBack: number | null
}

export const ReasoningStepSidebar: Component<Props> = (props) => {
  return (
    <Show when={props.open}>
      <div class="fixed inset-0 z-40 bg-black/30" onClick={props.onClose} />
      <div class="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-lg overflow-y-auto">
        <div class="flex items-center justify-between px-4 py-4 border-b">
          <h2 class="font-semibold">Menu</h2>
          <button onClick={props.onClose} class="p-1 hover:bg-gray-100 rounded cursor-pointer">✕</button>
        </div>
        <div class="flex flex-col gap-6 p-4">

          <Show when={props.createdByName}>
            <p class="text-sm text-gray-400">Created by {props.createdByName}</p>
          </Show>

          <Show when={!props.editing}>
            <button
              onClick={props.onEdit}
              class="text-sm border rounded px-3 py-2 hover:bg-gray-50 text-left cursor-pointer"
            >
              Edit
            </button>
          </Show>

          <Show when={(props.dependents?.length ?? 0) > 0}>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Depended on by</h3>
              <ul class="flex flex-col gap-1">
                <For each={props.dependents}>
                  {dep => (
                    <li>
                      <A href={`/step/${dep.id}`} class="text-green-700 hover:underline text-sm" onClick={props.onClose}>
                        {dep.question}
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Show>

          <div>
            <button
              class="text-sm text-gray-500 hover:text-gray-800 mb-2 cursor-pointer"
              onClick={props.onToggleDeps}
            >
              {props.showDeps ? '▲ Hide dependencies' : `▼ Show dependencies (${props.deps?.length ?? 0})`}
            </button>
            <Show when={props.showDeps}>
              <ul class="flex flex-col gap-1">
                <For each={props.deps} fallback={<li class="text-sm text-gray-400">No dependencies yet.</li>}>
                  {dep => (
                    <li>
                      <A href={`/step/${dep.id}`} class="text-green-700 hover:underline text-sm" onClick={props.onClose}>
                        {dep.question}
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
            <button
              class="text-sm border rounded px-3 py-2 hover:bg-gray-50 mt-2 cursor-pointer"
              onClick={props.onAddDep}
            >
              + Add dependency
            </button>
          </div>

          <Show when={(props.versions?.length ?? 0) > 0}>
            <div>
              <button
                class="text-sm text-gray-500 hover:text-gray-800 mb-2 cursor-pointer"
                onClick={props.onToggleHistory}
              >
                {props.showHistory ? '▲ Hide edit history' : '▼ Show edit history'}
              </button>
              <Show when={props.showHistory}>
                <ul class="flex flex-col gap-2 mt-2">
                  <For each={props.versions}>
                    {v => (
                      <VersionHistoryItem
                        version={v}
                        expanded={props.previewVersionId === v.id}
                        onToggle={() => props.onTogglePreview(v.id)}
                        onRestore={() => props.onRestore(v.id)}
                        restoring={props.rollingBack === v.id}
                      />
                    )}
                  </For>
                </ul>
              </Show>
            </div>
          </Show>

        </div>
      </div>
    </Show>
  )
}
