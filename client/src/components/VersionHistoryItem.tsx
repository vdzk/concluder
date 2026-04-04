import { Show, type Component } from 'solid-js'
import type { Version } from '../pages/ReasoningStepPage'
import { Button } from './ui/Button'
import { Text, TextBlock } from './ui/Text'

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
          <TextBlock color="muted">
            Version {props.version.version} — {new Date(props.version.editedAt).toLocaleString()} — {props.version.editedByName}
          </TextBlock>
          <TextBlock class="truncate">{props.version.question}</TextBlock>
        </div>
        <Text color="muted" class="shrink-0">{props.expanded ? '▲' : '▼'}</Text>
      </button>

      <Show when={props.expanded}>
        <div class="border-t dark:border-gray-700 px-4 py-4 flex flex-col gap-4 bg-gray-50 dark:bg-gray-800">
          <section>
            <TextBlock size="lg" bold color="muted" class="uppercase tracking-wide mb-1">Question</TextBlock>
            <TextBlock>{props.version.question}</TextBlock>
          </section>
          <section>
            <TextBlock size="lg" bold color="muted" class="uppercase tracking-wide mb-1">Analysis</TextBlock>
            <TextBlock>{props.version.analysis}</TextBlock>
          </section>
          <section>
            <TextBlock size="lg" bold color="muted" class="uppercase tracking-wide mb-1">Conclusion</TextBlock>
            <TextBlock>{props.version.conclusion}</TextBlock>
          </section>
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
