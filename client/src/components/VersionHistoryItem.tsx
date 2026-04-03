import { Show, type Component } from 'solid-js'
import type { Version } from '../pages/ReasoningStepPage'

type Props = {
  version: Version
  expanded: boolean
  onToggle: () => void
  onRestore: () => void
  restoring: boolean
  isAdmin: boolean
}

export const VersionHistoryItem: Component<Props> = (props) => {
  return (
    <li class="border dark:border-gray-700 rounded overflow-hidden">
      <button
        class="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
        onClick={props.onToggle}
      >
        <div class="min-w-0">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Version {props.version.version} — {new Date(props.version.editedAt).toLocaleString()} — {props.version.editedByName}
          </p>
          <p class="truncate">{props.version.question}</p>
        </div>
        <span class="shrink-0 text-gray-400 dark:text-gray-500 text-sm">{props.expanded ? '▲' : '▼'}</span>
      </button>

      <Show when={props.expanded}>
        <div class="border-t dark:border-gray-700 px-4 py-4 flex flex-col gap-4 bg-gray-50 dark:bg-gray-800">
          <section>
            <h3 class="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Question</h3>
            <p class="text-gray-800 dark:text-gray-200">{props.version.question}</p>
          </section>
          <section>
            <h3 class="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Analysis</h3>
            <p class="text-gray-800 dark:text-gray-200">{props.version.analysis}</p>
          </section>
          <section>
            <h3 class="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Conclusion</h3>
            <p class="text-gray-800 dark:text-gray-200">{props.version.conclusion}</p>
          </section>
          <Show when={props.isAdmin}>
            <button
              onClick={props.onRestore}
              disabled={props.restoring}
              class="self-start text-sm border dark:border-gray-600 rounded px-4 py-2 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {props.restoring ? 'Restoring…' : 'Restore this version'}
            </button>
          </Show>
        </div>
      </Show>
    </li>
  )
}
