import { createEffect, createResource, createSignal, For, Show, type Component } from 'solid-js'
import { A } from '@solidjs/router'
import { trpc } from '../trpc'
import { DefinitionContent } from '../components/DefinitionContent'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'

type Props = { initialId?: number };

export const DefinitionsPage: Component<Props> = (props) => {
  const [definitions, { refetch }] = createResource(() => trpc.definition.list.query());
  const [selectedId, setSelectedId] = createSignal<number | null>(props.initialId ?? null);
  const [rightMode, setRightMode] = createSignal<'view' | 'add' | 'none'>(props.initialId ? 'view' : 'none');
  const [term, setTerm] = createSignal('');
  const [text, setText] = createSignal('');
  const [status, setStatus] = createSignal<'idle' | 'loading' | 'error'>('idle');
  const selectedTerm = () => definitions()?.find(d => d.id === selectedId())?.term;
  createEffect(() => { document.title = selectedTerm() ? `${selectedTerm()} – Definitions` : 'Definitions'; })

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
          <Button variant="icon" onClick={openAdd} title="Add definition">+</Button>
        </div>

        <div class="flex flex-col">
          <For each={definitions()} fallback={<EmptyState message="No definitions yet." />}>
            {def => (
              <button
                onClick={() => selectDefinition(def.id)}
                class={`flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 rounded text-left cursor-pointer ${
                  selectedId() === def.id ? 'bg-amber-50 dark:bg-amber-900/30' : ''
                }`}
              >
                <span class="font-semibold text-amber-800 dark:text-amber-400">{def.term}</span>
                <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Divider */}
      <div class="w-px bg-gray-400 dark:bg-gray-600 self-stretch" />

      {/* Right column – definition view or add form */}
      <div class="flex flex-col w-1/2 overflow-y-auto">

        <div class="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
          <A href="/" class="px-3 py-2 text-sm border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 -mb-px transition-colors">Home</A>
        </div>

        <div class="flex flex-col gap-6 px-10 py-10">
          <Show when={rightMode() === 'add'}>
            <div class="flex flex-col gap-4">
              <h2 class="text-xl font-semibold">Add a definition</h2>
              <form onSubmit={handleSubmit} class="flex flex-col gap-4">
                <label class="flex flex-col gap-1">
                  <span class="font-medium text-sm">Term</span>
                  <Input
                    value={term()}
                    onInput={e => setTerm(e.currentTarget.value)}
                    placeholder="e.g. Opportunity cost"
                    required
                    autofocus
                  />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="font-medium text-sm">Definition</span>
                  <Textarea
                    class="min-h-20 resize-y"
                    value={text()}
                    onInput={e => setText(e.currentTarget.value)}
                    placeholder="What does this term mean?"
                    required
                  />
                </label>
                <div class="flex gap-2">
                  <Button type="submit" size="sm" color="amber" disabled={status() === 'loading'}>
                    {status() === 'loading' ? 'Adding…' : 'Add definition'}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setRightMode('none')}>
                    Cancel
                  </Button>
                </div>
                {status() === 'error' && <p class="text-red-600 dark:text-red-400 text-sm">Something went wrong.</p>}
              </form>
              <p class="text-xs text-gray-400 dark:text-gray-500 italic">Links to new definitions in analysis texts will appear only after they are re-saved.</p>
            </div>
          </Show>

          <Show when={rightMode() === 'view' && selectedId() !== null}>
            <DefinitionContent id={selectedId()!} />
          </Show>

          <Show when={rightMode() === 'none'}>
            <p class="text-gray-400 dark:text-gray-500">Select a definition to view it, or press + to add one.</p>
          </Show>
        </div>

      </div>

    </div>
  );
};
