import { createResource, createSignal, Show, type Component } from 'solid-js'
import { useParams, useSearchParams } from '@solidjs/router'
import { trpc } from '../trpc'
import { ReasoningStepForm } from '../components/ReasoningStepForm'
import { StepContent, type TextSelection } from '../components/StepContent'
import { HistoryTab } from '../components/HistoryTab'
import { DepsTab } from '../components/DepsTab'
import { BreadcrumbsTab } from '../components/BreadcrumbsTab'
import { TabBar, type Tab } from '../components/TabBar'
import { TalkTab } from '../components/TalkTab'

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
  const [searchParams, setSearchParams] = useSearchParams<{ tab?: string }>();
  const activeTab = (): Tab | null => {
    const t = searchParams.tab;
    if (t === undefined) return 'breadcrumbs';
    if (t === '') return null;
    return t as Tab;
  };
  const setActiveTab = (tabOrUpdater: Tab | null | ((prev: Tab | null) => Tab | null)) => {
    const next = typeof tabOrUpdater === 'function' ? tabOrUpdater(activeTab()) : tabOrUpdater;
    setSearchParams({ tab: next ?? '' }, { replace: true });
  };
  const [versions, { refetch: refetchVersions }] = createResource(
    () => trpc.reasoningStep.versions.query({ reasoningStepId: props.id })
  );
  const [rollingBack, setRollingBack] = createSignal<number | null>(null);
  const [previewVersionId, setPreviewVersionId] = createSignal<number | null>(null);
  const [deps, { refetch: refetchDeps }] = createResource(
    () => trpc.reasoningStep.dependencies.query({ reasoningStepId: props.id })
  )
  const [dependents] = createResource(
    () => trpc.reasoningStep.dependents.query({ reasoningStepId: props.id })
  )
  const [breadcrumbs] = createResource(
    () => trpc.reasoningStep.breadcrumbs.query({ reasoningStepId: props.id })
  )
  const [adminStatus] = createResource(() => trpc.user.isAdmin.query())
  const [messages, { mutate: mutateMessages }] = createResource(
    () => trpc.talkMessage.list.query({ reasoningStepId: props.id })
  )
  const [selection, setSelection] = createSignal<TextSelection | null>(null)

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
      <div class="flex flex-col gap-6 w-1/2 px-10 py-10 overflow-y-auto">
        <Show when={step()} fallback={<p class="text-gray-500">{step.loading ? 'Loading…' : 'Not found.'}</p>}>
          {s => (
            <StepContent
              question={s().question}
              analysis={s().analysis}
              annotatedAnalysis={s().annotatedAnalysis}
              conclusion={s().conclusion}
              onSelectionChange={setSelection}
            />
          )}
        </Show>
      </div>

      {/* Divider */}
      <div class="w-px bg-gray-400 self-stretch" />

      {/* Right column – controls */}
      <div class="flex flex-col w-1/2 overflow-y-auto">

        <TabBar
          activeTab={activeTab()}
          onToggleTab={tab => setActiveTab(prev => prev === tab ? null : tab)}
        />

        {/* Tab content */}
        <div class="flex flex-col gap-6 px-10 py-6">
        <Show when={activeTab() !== null}>

          {/* Breadcrumbs tab */}
          <Show when={activeTab() === 'breadcrumbs'}>
            <BreadcrumbsTab ancestors={breadcrumbs() ?? []} currentQuestion={step()?.question ?? ''} />
          </Show>

          {/* History tab */}
          <Show when={activeTab() === 'history'}>
            <HistoryTab
              createdByName={step()?.createdByName}
              versions={versions()}
              previewVersionId={previewVersionId()}
              onTogglePreview={id => setPreviewVersionId(prev => prev === id ? null : id)}
              onRestore={handleRollback}
              rollingBack={rollingBack()}
              isAdmin={adminStatus()?.isAdmin ?? false}
            />
          </Show>

          {/* Dependencies tab */}
          <Show when={activeTab() === 'deps'}>
            <DepsTab
              dependents={dependents()}
              deps={deps()}
              onAddDep={async (values) => {
                await trpc.reasoningStep.addDependency.mutate({
                  sourceId: props.id,
                  ...values,
                });
                refetchDeps();
                refetchStep();
              }}
              selection={selection()}
              onLink={async (depId) => {
                const sel = selection();
                if (!sel) return;
                const updated = await trpc.reasoningStep.linkAnnotation.mutate({
                  stepId: props.id,
                  dependencyId: depId,
                  startOffset: sel.start,
                  endOffset: sel.end,
                });
                mutate(updated);
                setSelection(null);
                window.getSelection()?.removeAllRanges();
              }}
            />
          </Show>

          {/* Talk tab */}
          <Show when={activeTab() === 'talk'}>
            <TalkTab
              messages={messages()}
              currentUserId={undefined}
              onSend={async (body) => {
                const msg = await trpc.talkMessage.send.mutate({
                  reasoningStepId: props.id,
                  body,
                });
                mutateMessages(prev => [...(prev ?? []), msg]);
              }}
            />
          </Show>

          {/* Edit tab */}
          <Show when={activeTab() === 'edit'}>
            <Show when={step()}>
              {s => (
                <ReasoningStepForm
                  initialValues={s()}
                  submitLabel="Save"
                  depCount={deps()?.length ?? 0}
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

        </Show>

        </div>
      </div>
    </div>
  );
}
