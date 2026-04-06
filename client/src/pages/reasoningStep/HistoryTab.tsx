import { Show, For, type Component } from 'solid-js'
import { VersionHistoryItem } from './VersionHistoryItem'
import { EmptyState } from '../../uiLib/EmptyState'
import { TextBlock } from '../../uiLib/Text'
import type { Version } from './ReasoningStepPage'

type Props = {
  createdByName: string | undefined
  createdAt: Date | string | undefined
  versions: Version[] | undefined
  previewVersionId: number | null
  onTogglePreview: (id: number) => void
  onRestore: (id: number) => void
  rollingBack: number | null
  isAdmin: boolean
}

export const HistoryTab: Component<Props> = (props) => {
  return (
    <div class="flex flex-col gap-4">
      <Show when={props.createdByName}>
        <TextBlock color="muted">Current version created by {props.createdByName} on {new Date(props.createdAt!).toISOString().slice(0, 16).replace('T', ' ')}</TextBlock>
      </Show>
      <Show
        when={(props.versions?.length ?? 0) > 0}
        fallback={<EmptyState message="No edit history yet." />}
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
                isAdmin={props.isAdmin}
              />
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
