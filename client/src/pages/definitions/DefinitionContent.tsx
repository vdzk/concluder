import { Show, type Component } from 'solid-js'
import { TextBlock } from '../../uiLib/Text'

type Props = {
  term: string
  text: string
}

export const DefinitionContent: Component<Props> = (props) => {
  return (
    <Show
      when={props.term}
      fallback={<TextBlock color="muted">Definition not found.</TextBlock>}
    >
      <h1 class="text-2xl font-semibold text-amber-800 dark:text-amber-400">{props.term}</h1>
      <TextBlock class="whitespace-pre-wrap">{props.text}</TextBlock>
    </Show>
  );
}
