import { Show, type Component } from 'solid-js'
import type { Version } from './ReasoningStepPage'
import { Button } from '../../uiLib/Button'
import { Text, TextBlock } from '../../uiLib/Text'
import { StepSection } from '../../uiLib/StepSection'

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
        class="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-orange-100 dark:hover:bg-gray-800 cursor-pointer"
        onClick={props.onToggle}
      >
        <div class="min-w-0">
          <TextBlock color="muted">
            Version {props.version.version} — {new Date(props.version.createdAt).toISOString().slice(0, 16).replace('T', ' ')} — {props.version.createdByName}
          </TextBlock>
        </div>
        <Text color="muted" class="shrink-0">{props.expanded ? '▲' : '▼'}</Text>
      </button>

      <Show when={props.expanded}>
        <div class="border-t dark:border-gray-700 px-4 py-4 flex flex-col gap-4 bg-gray-50 dark:bg-gray-800">
          <StepSection label="Question"><TextBlock>{props.version.question}</TextBlock></StepSection>
          <StepSection label="Analysis"><TextBlock>{props.version.analysis}</TextBlock></StepSection>
          <StepSection label="Conclusion"><TextBlock>{props.version.conclusion}</TextBlock></StepSection>
          <Show when={props.isAdmin}>
            <Button variant="secondary" onClick={props.onRestore} disabled={props.restoring}>
              {props.restoring ? 'Restoring…' : 'Restore this version'}
            </Button>
          </Show>
        </div>
      </Show>
    </li>
  )
}
