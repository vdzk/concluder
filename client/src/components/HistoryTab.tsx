import { Show, For, type Component } from 'solid-js'
import { VersionHistoryItem } from './VersionHistoryItem'
import type { Version } from '../pages/ReasoningStepPage'

type Props = {
  createdByName: string | undefined
  versions: Version[] | undefined
  previewVersionId: number | null
  onTogglePreview: (id: number) => void
  onRestore: (id: number) => void
  rollingBack: number | null
}

export const HistoryTab: Component<Props> = (props) => {
  return (
    <div class="flex flex-col gap-4">
      <Show when={props.createdByName}>
        <p class="text-sm text-gray-400">Created by {props.createdByName}</p>
      </Show>
      <Show
        when={(props.versions?.length ?? 0) > 0}
        fallback={<p class="text-sm text-gray-400">No edit history yet.</p>}
      >
        <ul class="flex flex-col gap-2">
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
  )
}
