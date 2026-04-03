import { createResource, Show, type Component } from 'solid-js'
import { trpc } from '../trpc'

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
      fallback={<p class="text-gray-500 dark:text-gray-400">{definition.loading ? 'Loading…' : 'Definition not found.'}</p>}
    >
      {def => (
        <>
          <h1 class="text-2xl font-semibold text-amber-800 dark:text-amber-400">{def().term}</h1>
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{def().text}</p>
        </>
      )}
    </Show>
  );
}
