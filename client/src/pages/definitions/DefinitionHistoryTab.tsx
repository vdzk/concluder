import { Show, For, type Component } from 'solid-js'
import { EmptyState } from '../../uiLib/EmptyState'
import { Button } from '../../uiLib/Button'
import { Text, TextBlock } from '../../uiLib/Text'
import { StepSection } from '../../uiLib/StepSection'

export type DefinitionVersion = {
  id: number
  definitionId: number
  version: number
  term: string
  text: string
  changeSummary: string | null
  createdBy: number
  createdAt: Date | string
  createdByName: string
}

const CURRENT_VERSION_ID = -1

type Props = {
  createdByName: string | undefined
  createdAt: Date | string | undefined
  currentTerm: string | undefined
  currentText: string | undefined
  currentChangeSummary: string | null | undefined
  versions: DefinitionVersion[] | undefined
  previewVersionId: number | null
  onTogglePreview: (id: number) => void
}

export const DefinitionHistoryTab: Component<Props> = (props) => {
  const currentVersion = (): DefinitionVersion | undefined => {
    if (!props.createdByName || !props.createdAt || !props.currentTerm) return undefined
    return {
      id: CURRENT_VERSION_ID,
      definitionId: -1,
      version: (props.versions?.[0]?.version ?? 0) + 1,
      term: props.currentTerm,
      text: props.currentText ?? '',
      changeSummary: props.currentChangeSummary ?? null,
      createdBy: -1,
      createdAt: props.createdAt,
      createdByName: props.createdByName,
    }
  }

  return (
    <div class="flex flex-col gap-4">
      <Show
        when={(props.versions?.length ?? 0) > 0 || currentVersion()}
        fallback={<EmptyState message="No edit history yet." />}
      >
        <ul class="flex flex-col gap-2">
          <Show when={currentVersion()}>
            {cv => (
              <DefinitionVersionItem
                version={cv()}
                expanded={props.previewVersionId === CURRENT_VERSION_ID}
                onToggle={() => props.onTogglePreview(CURRENT_VERSION_ID)}
                isCurrent
              />
            )}
          </Show>
          <For each={props.versions}>
            {v => (
              <DefinitionVersionItem
                version={v}
                expanded={props.previewVersionId === v.id}
                onToggle={() => props.onTogglePreview(v.id)}
              />
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}

type ItemProps = {
  version: DefinitionVersion
  expanded: boolean
  onToggle: () => void
  isCurrent?: boolean
}

const DefinitionVersionItem: Component<ItemProps> = (props) => {
  return (
    <li class="border dark:border-gray-700 rounded overflow-hidden">
      <button
        class="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-amber-100 dark:hover:bg-gray-800 cursor-pointer"
        onClick={props.onToggle}
      >
        <div class="min-w-0">
          <TextBlock color="muted">
            Version {props.version.version} — {new Date(props.version.createdAt).toISOString().slice(0, 16).replace('T', ' ')} — {props.version.createdByName}{props.isCurrent ? ' (current)' : ''}
          </TextBlock>
          <Show when={props.version.changeSummary}>
            <TextBlock>{props.version.changeSummary}</TextBlock>
          </Show>
        </div>
        <Text color="muted" class="shrink-0">{props.expanded ? '▲' : '▼'}</Text>
      </button>

      <Show when={props.expanded}>
        <div class="border-t dark:border-gray-700 px-4 py-4 flex flex-col gap-4 bg-gray-50 dark:bg-gray-800">
          <StepSection label="Term"><TextBlock>{props.version.term}</TextBlock></StepSection>
          <StepSection label="Definition"><TextBlock class="whitespace-pre-line">{props.version.text}</TextBlock></StepSection>
        </div>
      </Show>
    </li>
  )
}
