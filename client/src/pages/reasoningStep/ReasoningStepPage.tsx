import { createEffect, createResource, createSignal, Match, Show, Switch, type Component } from 'solid-js'
import { useParams, useSearchParams } from '@solidjs/router'
import { trpc } from '../../trpc'
import { ReasoningStepForm } from './ReasoningStepForm'
import { StepContent, type TextSelection } from './StepContent'
import { HistoryTab } from './HistoryTab'
import { DepsTab } from './DepsTab'
import { BreadcrumbsTab } from './BreadcrumbsTab'
import { TabBar, type Tab } from './TabBar'
import { TalkTab } from './TalkTab'
import { TextBlock } from '../../uiLib/Text'
import { TwoColumnLayout } from '../../uiLib/TwoColumnLayout'

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
  createEffect(() => { document.title = step()?.question ?? 'Concluder'; })

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

  const handleToggleTab = (tab: Tab) => setActiveTab(prev => prev === tab ? null : tab);

  const handleTogglePreview = (id: number) => setPreviewVersionId(prev => prev === id ? null : id);

  const handleAddDep: Parameters<typeof DepsTab>[0]['onAddDep'] = async (values) => {
    await trpc.reasoningStep.addDependency.mutate({ sourceId: props.id, ...values });
    refetchDeps();
    refetchStep();
  };

  const handleLink = async (depId: number) => {
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
  };

  const handleRemoveLink = async () => {
    const sel = selection();
    if (!sel) return;
    const updated = await trpc.reasoningStep.removeAnnotationLink.mutate({
      stepId: props.id,
      startOffset: sel.start,
      endOffset: sel.end,
    });
    mutate(updated);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleSend = async (body: string) => {
    const msg = await trpc.talkMessage.send.mutate({ reasoningStepId: props.id, body });
    mutateMessages(prev => [...(prev ?? []), msg]);
  };

  const handleSubmitEdit: Parameters<typeof ReasoningStepForm>[0]['onSubmit'] = async (values) => {
    const updated = await trpc.reasoningStep.update.mutate({ id: props.id, ...values });
    mutate(updated);
    setActiveTab('history');
    refetchVersions();
  };

  return (
    <TwoColumnLayout
      leftLabel="Step"
      rightLabel="Sidebar"
      leftClass="gap-6 px-4 py-6 lg:px-10 lg:py-10"
      left={<>
        <Show when={step()} fallback={<TextBlock color="muted">{step.loading ? 'Loading…' : 'Not found.'}</TextBlock>}>
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
      </>}
      right={<>
        <TabBar
          activeTab={activeTab()}
          onToggleTab={handleToggleTab}
        />
        <div class="flex flex-col gap-6 px-4 py-4 lg:px-10 lg:py-6">
        <Switch>
          <Match when={activeTab() === 'breadcrumbs'}>
            <BreadcrumbsTab
              ancestors={breadcrumbs() ?? []}
              currentQuestion={step()?.question ?? ''}
            />
          </Match>
          <Match when={activeTab() === 'history'}>
            <HistoryTab
              createdByName={step()?.createdByName}
              createdAt={step()?.createdAt}
              currentQuestion={step()?.question}
              currentAnalysis={step()?.analysis}
              currentConclusion={step()?.conclusion}
              currentChangeSummary={step()?.changeSummary}
              versions={versions()}
              previewVersionId={previewVersionId()}
              onTogglePreview={handleTogglePreview}
              onRestore={handleRollback}
              rollingBack={rollingBack()}
              isAdmin={adminStatus()?.isAdmin ?? false}
            />
          </Match>
          <Match when={activeTab() === 'deps'}>
            <DepsTab
              dependents={dependents()}
              deps={deps()}
              onAddDep={handleAddDep}
              selection={selection()}
              annotatedAnalysis={step()?.annotatedAnalysis}
              onLink={handleLink}
              onRemoveLink={handleRemoveLink}
            />
          </Match>
          <Match when={activeTab() === 'talk'}>
            <TalkTab
              messages={messages()}
              currentUserId={undefined}
              onSend={handleSend}
            />
          </Match>
          <Match when={activeTab() === 'edit'}>
            <Show when={step()}>
              {s => (
                <ReasoningStepForm
                  initialValues={s()}
                  submitLabel="Save"
                  depCount={deps()?.length ?? 0}
                  onSubmit={handleSubmitEdit}
                  onCancel={() => setActiveTab(null)}
                />
              )}
            </Show>
          </Match>
        </Switch>
        </div>
      </>}
    />
  );
}
