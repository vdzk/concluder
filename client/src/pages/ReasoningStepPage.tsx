import { createResource, createSignal, Show, type Component } from 'solid-js'
import { useParams, A } from '@solidjs/router'
import { trpc } from '../trpc'
import { ReasoningStepForm } from '../components/ReasoningStepForm';
import { StepContent } from '../components/StepContent';
import { StepView } from '../components/StepView';
import { DefinitionContent } from '../components/DefinitionContent';
import { HistoryTab } from '../components/HistoryTab';
import { DepsTab } from '../components/DepsTab';
import { NavButton } from '../components/NavButton';
import { TabBar, type Tab } from '../components/TabBar';

export type Version = NonNullable<Awaited<ReturnType<typeof trpc.reasoningStep.versions.query>>>[number];

export const ReasoningStepPage: Component = () => {
  const params = useParams<{ id: string }>();
  return (
    <Show when={params.id} keyed>
      {id => <ReasoningStepInner id={Number(id)} />}
    </Show>
  );
};

const ReasoningStepInner: Component<{ id: number }> = (props) => {
  const [step, { mutate, refetch: refetchStep }] = createResource(() => trpc.reasoningStep.getById.query({ id: props.id }));
  const [activeTab, setActiveTab] = createSignal<Tab | null>(null);
  const [tabsOpen, setTabsOpen] = createSignal(false);
  const [versions, { refetch: refetchVersions }] = createResource(
    () => trpc.reasoningStep.versions.query({ reasoningStepId: props.id })
  );
  const [rollingBack, setRollingBack] = createSignal<number | null>(null);
  const [previewVersionId, setPreviewVersionId] = createSignal<number | null>(null);
  const [deps, { refetch: refetchDeps }] = createResource(
    () => trpc.reasoningStep.dependencies.query({ reasoningStepId: props.id })
  );
  const [dependents] = createResource(
    () => trpc.reasoningStep.dependents.query({ reasoningStepId: props.id })
  );

  // Preview state
  const [previewTarget, setPreviewTarget] = createSignal<{ type: 'step'; id: number } | { type: 'definition'; id: number } | null>(null);

  const upHref = () => {
    const d = dependents();
    return d && d.length > 0 ? `/step/${d[0].id}` : '/';
  };

  const openPreview = (target: { type: 'step'; id: number } | { type: 'definition'; id: number }) => {
    setPreviewTarget(target);
    setTabsOpen(true);
    setActiveTab('preview');
  };

  const handleRollback = async (versionId: number) => {
    setRollingBack(versionId);
    try {
      const updated = await trpc.reasoningStep.rollback.mutate({ versionId });
      mutate(updated);
      setPreviewVersionId(null);
      refetchVersions();
    } finally {
      setRollingBack(null);
    }
  };

  return (
    <div class="flex h-full">

      {/* Left column – content */}
      <div class="flex flex-col justify-between gap-6 w-1/2 px-10 py-10 overflow-y-auto">
        <Show when={step()} fallback={<p class="text-gray-500">{step.loading ? 'Loading…' : 'Not found.'}</p>}>
          {s => (
            <StepContent
              question={s().question}
              analysis={s().analysis}
              annotatedAnalysis={s().annotatedAnalysis}
              conclusion={s().conclusion}
              onStepClick={(id) => openPreview({ type: 'step', id })}
              onDefinitionClick={(id) => openPreview({ type: 'definition', id })}
            />
          )}
        </Show>
        <div class="flex-1" />
        <Show when={dependents() && dependents()!.length > 0}>
          <NavButton href={upHref()} />
        </Show>
      </div>

      {/* Divider */}
      <div class="w-px bg-gray-400 self-stretch" />

      {/* Right column – controls */}
      <div class="flex flex-col gap-6 w-1/2 px-10 py-10 overflow-y-auto">

        <TabBar
          open={tabsOpen()}
          onToggleOpen={() => { setTabsOpen(v => !v); setActiveTab(null); }}
          activeTab={activeTab()}
          onToggleTab={tab => setActiveTab(prev => prev === tab ? null : tab)}
        />

        {/* Tab content */}
        <Show when={activeTab() !== null}>

          {/* History tab */}
          <Show when={activeTab() === 'history'}>
            <HistoryTab
              createdByName={step()?.createdByName}
              versions={versions()}
              previewVersionId={previewVersionId()}
              onTogglePreview={id => setPreviewVersionId(prev => prev === id ? null : id)}
              onRestore={handleRollback}
              rollingBack={rollingBack()}
            />
          </Show>

          {/* Dependencies tab */}
          <Show when={activeTab() === 'deps'}>
            <DepsTab dependents={dependents()} deps={deps()} />
          </Show>

          {/* New dependency tab */}
          <Show when={activeTab() === 'new-dep'}>
            <ReasoningStepForm
              submitLabel="Create dependency"
              onSubmit={async (values) => {
                await trpc.reasoningStep.addDependency.mutate({
                  sourceId: props.id,
                  ...values,
                });
                refetchDeps();
                refetchStep();
                setActiveTab('deps');
              }}
              onCancel={() => setActiveTab(null)}
            />
          </Show>

          {/* Edit tab */}
          <Show when={activeTab() === 'edit'}>
            <Show when={step()}>
              {s => (
                <ReasoningStepForm
                  initialValues={s()}
                  submitLabel="Save"
                  onSubmit={async (values) => {
                    const updated = await trpc.reasoningStep.update.mutate({ id: props.id, ...values });
                    mutate(updated);
                    setActiveTab('history');
                    refetchVersions();
                  }}
                  onCancel={() => setActiveTab(null)}
                />
              )}
            </Show>
          </Show>

          {/* Preview tab */}
          <Show when={activeTab() === 'preview' && previewTarget()}>
            {target => (
              <div class="flex flex-col gap-4">
                <Show when={target().type === 'step'}>
                  <StepView
                    id={target().id}
                    onStepClick={(id) => openPreview({ type: 'step', id })}
                    onDefinitionClick={(id) => openPreview({ type: 'definition', id })}
                  />
                  <A
                    href={`/step/${target().id}`}
                    class="text-sm text-green-700 hover:underline"
                  >
                    Open full page &rarr;
                  </A>
                </Show>
                <Show when={target().type === 'definition'}>
                  <DefinitionContent id={target().id} />
                  <A
                    href={`/definition/${target().id}`}
                    class="text-sm text-amber-700 hover:underline"
                  >
                    Open full page &rarr;
                  </A>
                </Show>
              </div>
            )}
          </Show>

        </Show>

      </div>
    </div>
  );
}
