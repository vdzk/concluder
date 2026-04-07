import { createEffect, createResource, createSignal, For, Match, Show, Switch, type Component } from 'solid-js'
import { A, useNavigate, useParams, useSearchParams } from '@solidjs/router'
import { trpc } from '../../trpc'
import { BlockItem } from '../../uiLib/BlockItem'
import { TwoColumnLayout } from '../../uiLib/TwoColumnLayout'
import { DefinitionContent } from './DefinitionContent'
import { DefinitionEditForm } from './DefinitionEditForm'
import { DefinitionHistoryTab } from './DefinitionHistoryTab'
import { Button } from '../../uiLib/Button'
import { EmptyState } from '../../uiLib/EmptyState'
import { Input } from '../../uiLib/Input'
import { Text, TextBlock } from '../../uiLib/Text'
import { Textarea } from '../../uiLib/Textarea'

type DefTab = 'home' | 'edit' | 'history' | 'definitions' | 'add'

const BASE_TAB_CLASS = 'px-3 py-2 text-sm border-b-2 -mb-px transition-colors cursor-pointer'
const INACTIVE_TAB_CLASS = 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
const ACTIVE_TAB_CLASS = 'border-amber-600 dark:border-amber-500 text-amber-700 dark:text-amber-400 font-medium'

export const DefinitionsPage: Component = () => {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams<{ tab?: string }>();
  const selectedId = () => params.id ? Number(params.id) : null;

  const activeTab = (): DefTab => {
    const t = searchParams.tab as DefTab | undefined;
    if (t === 'edit' || t === 'history' || t === 'add') return t;
    if (t === 'definitions' || !selectedId()) return 'definitions';
    return 'home';
  };
  const setActiveTab = (tab: DefTab) => {
    const param = (tab === 'home') ? undefined : tab;
    setSearchParams({ tab: param });
  };

  const [definitions, { refetch: refetchDefinitions }] = createResource(
    () => trpc.definition.list.query()
  );
  const [definition, { refetch: refetchDefinition }] = createResource(
    () => selectedId(),
    (id) => trpc.definition.getById.query({ id })
  );
  const [versions, { refetch: refetchVersions }] = createResource(
    () => selectedId(),
    (id) => trpc.definition.versions.query({ definitionId: id })
  );
  const [previewVersionId, setPreviewVersionId] = createSignal<number | null>(null);

  // Add form state
  const [addTerm, setAddTerm] = createSignal('');
  const [addText, setAddText] = createSignal('');
  const [addStatus, setAddStatus] = createSignal<'idle' | 'loading' | 'error'>('idle');

  const selectedTerm = () => definition()?.term;
  createEffect(() => { document.title = selectedTerm() ? `${selectedTerm()} – Definitions` : 'Definitions'; })

  const selectDefinition = (id: number) => {
    const tab = activeTab();
    const param = (tab === 'home') ? undefined : tab;
    navigate(`/definitions/${id}${param ? `?tab=${param}` : ''}`);
  };

  const showDefinitionsList = () => {
    setActiveTab('definitions');
  };

  const handleAddSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setAddStatus('loading');
    try {
      const created = await trpc.definition.create.mutate({ term: addTerm(), text: addText() });
      setAddTerm('');
      setAddText('');
      setAddStatus('idle');
      refetchDefinitions();
      selectDefinition(created.id);
    } catch {
      setAddStatus('error');
    }
  };

  const handleSubmitEdit = async (values: { term: string; text: string }) => {
    const id = selectedId();
    if (!id) return;
    const updated = await trpc.definition.update.mutate({ id, ...values });
    refetchDefinition();
    setActiveTab('history');
    refetchVersions();
    refetchDefinitions();
  };

  const handleTogglePreview = (id: number) => setPreviewVersionId(prev => prev === id ? null : id);

  return (
    <TwoColumnLayout
      leftLabel="Definition"
      rightLabel="Sidebar"
      leftClass="gap-6 px-4 py-6 lg:px-10 lg:py-10"
      left={<>
        <Show when={selectedId() !== null} fallback={
          <TextBlock color="muted">Select a definition from the Definitions tab.</TextBlock>
        }>
          <Show when={definition()} fallback={<TextBlock color="muted">{definition.loading ? 'Loading…' : 'Definition not found.'}</TextBlock>}>
            {def => <DefinitionContent term={def().term} text={def().text} />}
          </Show>
        </Show>
      </>}
      right={<>
        <div class="flex flex-wrap items-center gap-1 border-b border-gray-200 dark:border-gray-700">
          <A href="/" class={`${BASE_TAB_CLASS} ${INACTIVE_TAB_CLASS}`}>Home</A>
          <Show when={selectedId()}>
            <button
              class={`${BASE_TAB_CLASS} ${activeTab() === 'edit' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}`}
              onClick={() => setActiveTab(activeTab() === 'edit' ? 'definitions' : 'edit')}
            >
              ✏️ Edit
            </button>
            <button
              class={`${BASE_TAB_CLASS} ${activeTab() === 'history' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}`}
              onClick={() => setActiveTab(activeTab() === 'history' ? 'definitions' : 'history')}
            >
              History
            </button>
          </Show>
          <button
            class={`${BASE_TAB_CLASS} ${activeTab() === 'definitions' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}`}
            onClick={showDefinitionsList}
          >
            Definitions
          </button>
          <button
            class={`${BASE_TAB_CLASS} ${activeTab() === 'add' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}`}
            onClick={() => setActiveTab(activeTab() === 'add' ? 'definitions' : 'add')}
          >
            + Add
          </button>
        </div>

        <div class="flex flex-col gap-6 px-4 py-4 lg:px-10 lg:py-6">
          <Switch>
            <Match when={activeTab() === 'edit' && selectedId()}>
              <Show when={definition()}>
                {def => (
                  <DefinitionEditForm
                    initialValues={{ term: def().term, text: def().text }}
                    onSubmit={handleSubmitEdit}
                    onCancel={() => setActiveTab('home')}
                  />
                )}
              </Show>
            </Match>
            <Match when={activeTab() === 'history' && selectedId()}>
              <DefinitionHistoryTab
                createdByName={definition()?.createdByName}
                createdAt={definition()?.createdAt}
                currentTerm={definition()?.term}
                currentText={definition()?.text}
                currentChangeSummary={definition()?.changeSummary}
                versions={versions()}
                previewVersionId={previewVersionId()}
                onTogglePreview={handleTogglePreview}
              />
            </Match>
            <Match when={activeTab() === 'home' && selectedId()}>
              <TextBlock color="muted">Viewing definition. Use the tabs above to edit or view history.</TextBlock>
            </Match>
            <Match when={activeTab() === 'definitions'}>
              <div class="flex flex-col gap-2">
                <For each={definitions()} fallback={<EmptyState message="No definitions yet." />}>
                  {def => (
                    <BlockItem
                      onClick={() => selectDefinition(def.id)}
                      class={`flex items-center justify-between ${selectedId() === def.id ? 'bg-amber-50 dark:bg-amber-900/30' : ''}`}
                    >
                      {def.term}
                    </BlockItem>
                  )}
                </For>
              </div>
            </Match>
            <Match when={activeTab() === 'add'}>
              <div class="flex flex-col gap-4">
                <h2 class="text-lg font-semibold">Add a definition</h2>
                <form onSubmit={handleAddSubmit} class="flex flex-col gap-4">
                  <label class="flex flex-col gap-1">
                    <span class="font-medium text-sm">Term</span>
                    <Input
                      value={addTerm()}
                      onInput={e => setAddTerm(e.currentTarget.value)}
                      placeholder="e.g. Opportunity cost"
                      required
                      autofocus
                    />
                  </label>
                  <label class="flex flex-col gap-1">
                    <span class="font-medium text-sm">Definition</span>
                    <Textarea
                      class="min-h-20 resize-y"
                      value={addText()}
                      onInput={e => setAddText(e.currentTarget.value)}
                      placeholder="What does this term mean?"
                      required
                    />
                  </label>
                  <div class="flex gap-2">
                    <Button type="submit" size="sm" color="amber" disabled={addStatus() === 'loading'}>
                      {addStatus() === 'loading' ? 'Adding…' : 'Add definition'}
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setActiveTab('definitions')}>
                      Cancel
                    </Button>
                  </div>
                  {addStatus() === 'error' && <p class="text-red-600 dark:text-red-400 text-sm">Something went wrong.</p>}
                </form>
                <Text size="xs" color="muted" bold class="uppercase tracking-wide px-1">Links to new definitions in analysis texts will appear only after they are re-saved.</Text>
              </div>
            </Match>
          </Switch>
        </div>
      </>}
    />
  );
};
