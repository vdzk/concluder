import { createEffect, createResource, createSignal, For, Show, type Component } from 'solid-js'
import { A, useNavigate, useParams } from '@solidjs/router'
import { trpc } from '../../trpc'
import { BlockItem } from '../../uiLib/BlockItem'
import { TwoColumnLayout } from '../../uiLib/TwoColumnLayout'
import { DefinitionContent } from './DefinitionContent'
import { Button } from '../../uiLib/Button'
import { EmptyState } from '../../uiLib/EmptyState'
import { Input } from '../../uiLib/Input'
import { Text, TextBlock } from '../../uiLib/Text'
import { Textarea } from '../../uiLib/Textarea'

export const DefinitionsPage: Component = () => {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const initialId = () => params.id ? Number(params.id) : null;
  const [definitions, { refetch }] = createResource(() => trpc.definition.list.query());
  const [selectedId, setSelectedId] = createSignal<number | null>(initialId());
  const [rightMode, setRightMode] = createSignal<'view' | 'add' | 'none'>(params.id ? 'view' : 'none');
  const [showRight, setShowRight] = createSignal(!!params.id);
  const [term, setTerm] = createSignal('');
  const [text, setText] = createSignal('');
  const [status, setStatus] = createSignal<'idle' | 'loading' | 'error'>('idle');
  const selectedTerm = () => definitions()?.find(d => d.id === selectedId())?.term;
  createEffect(() => { document.title = selectedTerm() ? `${selectedTerm()} – Definitions` : 'Definitions'; })

  const selectDefinition = (id: number) => {
    setSelectedId(id);
    setRightMode('view');
    setShowRight(true);
    navigate(`/definitions/${id}`, { replace: true });
  };

  const openAdd = () => {
    const closing = rightMode() === 'add';
    setRightMode(closing ? 'none' : 'add');
    if (!closing) setShowRight(true);
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
    <TwoColumnLayout
      leftLabel="Definitions"
      rightLabel="Details"
      leftClass="gap-6 px-4 py-6 lg:px-10 lg:py-10"
      showRight={showRight()}
      onShowRightChange={setShowRight}
      left={<>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-semibold">Definitions</h1>
          </div>
          <Button variant="icon" onClick={openAdd} title="Add definition">+</Button>
        </div>

        <div class="flex flex-col gap-2">
          <For each={definitions()} fallback={<EmptyState message="No definitions yet." />}>
            {def => (
              <BlockItem
                onClick={() => selectDefinition(def.id)}
                class={`flex items-center justify-between ${selectedId() === def.id ? 'bg-amber-50 dark:bg-amber-900/30' : ''}`}
              >
                <span>{def.term}</span>
                <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </BlockItem>
            )}
          </For>
        </div>
      </>}
      right={<>

        <div class="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
          <A href="/" class="px-3 py-2 text-sm border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 -mb-px transition-colors">Home</A>
        </div>

        <div class="flex flex-col gap-6 px-4 py-6 lg:px-10 lg:py-10">
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
              <Text size="xs" color="muted" bold class="uppercase tracking-wide px-1">Links to new definitions in analysis texts will appear only after they are re-saved.</Text>
            </div>
          </Show>

          <Show when={rightMode() === 'view' && selectedId() !== null}>
            <DefinitionContent id={selectedId()!} />
          </Show>

          <Show when={rightMode() === 'none'}>
            <TextBlock color="muted">Select a definition to view it, or press + to add one.</TextBlock>
          </Show>
        </div>
      </>}
    />
  );
};
