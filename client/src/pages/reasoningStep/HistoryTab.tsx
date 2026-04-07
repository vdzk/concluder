import { Show, For, type Component } from 'solid-js'
import { VersionHistoryItem } from './VersionHistoryItem'
import { EmptyState } from '../../uiLib/EmptyState'
import type { Version } from './ReasoningStepPage'

const CURRENT_VERSION_ID = -1

type Props = {
  createdByName: string | undefined
  createdAt: Date | string | undefined
  currentQuestion: string | undefined
  currentAnalysis: string | undefined
  currentConclusion: string | undefined
  currentChangeSummary: string | null | undefined
  versions: Version[] | undefined
  previewVersionId: number | null
  onTogglePreview: (id: number) => void
  onRestore: (id: number) => void
  rollingBack: number | null
  isAdmin: boolean
}

export const HistoryTab: Component<Props> = (props) => {
  const currentVersion = (): Version | undefined => {
    if (!props.createdByName || !props.createdAt || !props.currentQuestion) return undefined
    return {
      id: CURRENT_VERSION_ID,
      reasoningStepId: -1,
      version: (props.versions?.[0]?.version ?? 0) + 1,
      question: props.currentQuestion,
      analysis: props.currentAnalysis ?? '',
      conclusion: props.currentConclusion ?? '',
      changeSummary: props.currentChangeSummary ?? null,
      createdBy: -1,
      createdAt: props.createdAt,
      createdByName: props.createdByName,
    } as unknown as Version
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
              <VersionHistoryItem
                version={cv()}
                expanded={props.previewVersionId === CURRENT_VERSION_ID}
                onToggle={() => props.onTogglePreview(CURRENT_VERSION_ID)}
                onRestore={() => {}}
                restoring={false}
                isAdmin={false}
                isCurrent
              />
            )}
          </Show>
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
