import { createResource, Show, type Component } from 'solid-js'
import { trpc } from '../trpc'
import { TextBlock } from './ui/Text'

type Props = {
  id: number
}

export const DefinitionContent: Component<Props> = (props) => {
  const [definition] = createResource(
    () => props.id,
    (id) => trpc.definition.getById.query({ id })
  );

  return (
    <Show
      when={definition()}
      fallback={<TextBlock color="muted">{definition.loading ? 'Loading…' : 'Definition not found.'}</TextBlock>}
    >
      {def => (
        <>
          <h1 class="text-2xl font-semibold text-amber-800 dark:text-amber-400">{def().term}</h1>
          <TextBlock class="whitespace-pre-wrap">{def().text}</TextBlock>
        </>
      )}
    </Show>
  );
}
