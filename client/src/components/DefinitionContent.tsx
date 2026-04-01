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
      fallback={<p class="text-gray-500">{definition.loading ? 'Loading…' : 'Definition not found.'}</p>}
    >
      {def => (
        <>
          <h1 class="text-2xl font-semibold text-amber-800">{def().term}</h1>
          <p class="text-gray-700 whitespace-pre-wrap">{def().text}</p>
        </>
      )}
    </Show>
  );
}
