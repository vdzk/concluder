import { createResource, createSignal, For, Show, type Component } from 'solid-js';
import { A } from '@solidjs/router';
import { trpc } from '../trpc';
import { DefinitionContent } from '../components/DefinitionContent';

type Props = { initialId?: number };

export const DefinitionsPage: Component<Props> = (props) => {
  const [definitions, { refetch }] = createResource(() => trpc.definition.list.query());
  const [selectedId, setSelectedId] = createSignal<number | null>(props.initialId ?? null);
  const [rightMode, setRightMode] = createSignal<'view' | 'add' | 'none'>(props.initialId ? 'view' : 'none');
  const [term, setTerm] = createSignal('');
  const [text, setText] = createSignal('');
  const [status, setStatus] = createSignal<'idle' | 'loading' | 'error'>('idle');

  const selectDefinition = (id: number) => {
    setSelectedId(id);
    setRightMode('view');
  };

  const openAdd = () => {
    setRightMode(m => m === 'add' ? 'none' : 'add');
    setStatus('idle');
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const created = await trpc.definition.create.mutate({ term: term(), text: text() });
      setTerm('');
      setText('');
      setStatus('idle');
      refetch();
      selectDefinition(created.id);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div class="flex h-full">

      {/* Left column – term list */}
      <div class="flex flex-col gap-6 w-1/2 px-10 py-10 overflow-y-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-semibold">Definitions</h1>
          </div>
          <button
            onClick={openAdd}
            class="w-9 h-9 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 text-2xl leading-none cursor-pointer"
            title="Add definition"
          >
            +
          </button>
        </div>

        <div class="flex flex-col">
          <For each={definitions()} fallback={<p class="text-gray-500">No definitions yet.</p>}>
            {def => (
              <button
                onClick={() => selectDefinition(def.id)}
                class={`flex items-center justify-between border-b py-3 last:border-b-0 hover:bg-gray-50 -mx-2 px-2 rounded text-left cursor-pointer ${
                  selectedId() === def.id ? 'bg-amber-50' : ''
                }`}
              >
                <span class="font-semibold text-amber-800">{def.term}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Divider */}
      <div class="w-px bg-gray-400 self-stretch" />

      {/* Right column – definition view or add form */}
      <div class="flex flex-col gap-6 w-1/2 px-10 py-10 overflow-y-auto">

        <Show when={rightMode() === 'add'}>
          <div class="flex flex-col gap-4">
            <h2 class="text-xl font-semibold">Add a definition</h2>
            <form onSubmit={handleSubmit} class="flex flex-col gap-4">
              <label class="flex flex-col gap-1">
                <span class="font-medium text-sm">Term</span>
                <input
                  class="border rounded px-3 py-2"
                  value={term()}
                  onInput={e => setTerm(e.currentTarget.value)}
                  placeholder="e.g. Opportunity cost"
                  required
                  autofocus
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="font-medium text-sm">Definition</span>
                <textarea
                  class="border rounded px-3 py-2 min-h-20 resize-y"
                  value={text()}
                  onInput={e => setText(e.currentTarget.value)}
                  placeholder="What does this term mean?"
                  required
                />
              </label>
              <div class="flex gap-2">
                <button
                  type="submit"
                  disabled={status() === 'loading'}
                  class="bg-amber-700 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
                >
                  {status() === 'loading' ? 'Adding…' : 'Add definition'}
                </button>
                <button
                  type="button"
                  onClick={() => setRightMode('none')}
                  class="px-4 py-1.5 rounded text-sm border hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
              {status() === 'error' && <p class="text-red-600 text-sm">Something went wrong.</p>}
            </form>
          </div>
        </Show>

        <Show when={rightMode() === 'view' && selectedId() !== null}>
          <DefinitionContent id={selectedId()!} />
        </Show>

        <Show when={rightMode() === 'none'}>
          <p class="text-gray-400">Select a definition to view it, or press + to add one.</p>
        </Show>

      </div>

    </div>
  );
};
