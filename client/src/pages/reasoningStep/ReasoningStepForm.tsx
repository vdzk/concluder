import { createSignal, Show, type Component } from 'solid-js';
import { trpc } from '../../trpc';
import { Button } from '../../uiLib/Button';
import { Text, TextBlock } from '../../uiLib/Text';
import { Textarea } from '../../uiLib/Textarea';

type Values = { question: string; analysis: string; conclusion: string };

type Props = {
  initialValues?: Values;
  onSubmit?: (values: Values) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
  depCount?: number;
  placeholders?: { question?: string; analysis?: string; conclusion?: string };
};

export const ReasoningStepForm: Component<Props> = (props) => {
  const [question, setQuestion] = createSignal(props.initialValues?.question ?? '');
  const [analysis, setAnalysis] = createSignal(props.initialValues?.analysis ?? '');
  const [conclusion, setConclusion] = createSignal(props.initialValues?.conclusion ?? '');
  const [status, setStatus] = createSignal<'idle' | 'loading' | 'success' | 'error'>('idle');

  const isEditing = !!props.initialValues;
  const [checkNoErase, setCheckNoErase] = createSignal(false);
  const [checkNoContradiction, setCheckNoContradiction] = createSignal(false);
  const [checkFollows, setCheckFollows] = createSignal(false);
  const hasDepCount = () => (props.depCount ?? 0) > 0;
  const checksValid = () => !isEditing || (checkNoErase() && (!hasDepCount() || checkNoContradiction()) && checkFollows());

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      if (props.onSubmit) {
        await props.onSubmit({ question: question(), analysis: analysis(), conclusion: conclusion() });
      } else {
        await trpc.reasoningStep.create.mutate({ question: question(), analysis: analysis(), conclusion: conclusion() });
        setQuestion('');
        setAnalysis('');
        setConclusion('');
        setStatus('success');
        return;
      }
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} class="flex flex-col gap-4">
      {!props.onSubmit && <TextBlock size="xl" bold>New Reasoning Step</TextBlock>}

      <label class="flex flex-col gap-1">
        <Text bold>Question</Text>
        <Textarea rows={2} value={question()} onInput={e => setQuestion(e.currentTarget.value)} placeholder={props.placeholders?.question} required />
      </label>

      <label class="flex flex-col gap-1">
        <Text bold>Analysis</Text>
        <Textarea class="min-h-24" rows={10} value={analysis()} onInput={e => setAnalysis(e.currentTarget.value)} placeholder={props.placeholders?.analysis} required />
      </label>

      <label class="flex flex-col gap-1">
        <Text bold>Conclusion</Text>
        <Textarea rows={2} value={conclusion()} onInput={e => setConclusion(e.currentTarget.value)} placeholder={props.placeholders?.conclusion} required />
      </label>

      <div class="flex gap-3">
        <Show when={isEditing}>
          <fieldset class="flex flex-col gap-2 border dark:border-gray-600 rounded px-4 py-3 text-sm w-full">
            <Text size="xs" color="muted" bold class="uppercase tracking-wide px-1">Before saving, confirm:</Text>

            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" class="mt-0.5 cursor-pointer" checked={checkNoErase()} onChange={e => setCheckNoErase(e.currentTarget.checked)} />
              I didn't erase any points from the analysis.
            </label>
            <Show when={hasDepCount()}>
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" class="mt-0.5 cursor-pointer" checked={checkNoContradiction()} onChange={e => setCheckNoContradiction(e.currentTarget.checked)} />
                There is no contradiction between the analysis and the conclusions from all {props.depCount} sub-question{props.depCount === 1 ? '' : 's'}.
              </label>
            </Show>
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" class="mt-0.5 cursor-pointer" checked={checkFollows()} onChange={e => setCheckFollows(e.currentTarget.checked)} />
              The conclusion follows from the analysis and answers the question.
            </label>
          </fieldset>
        </Show>
      </div>

      <div class="flex gap-3">
        <Button type="submit" disabled={status() === 'loading' || !checksValid()}>
          {status() === 'loading' ? 'Saving…' : (props.submitLabel ?? 'Submit')}
        </Button>
        {props.onCancel && (
          <Button type="button" variant="secondary" onClick={props.onCancel}>Cancel</Button>
        )}
      </div>

      {status() === 'success' && <p class="text-green-700 dark:text-green-400">Entry saved!</p>}
      {status() === 'error' && <p class="text-red-600 dark:text-red-400">Something went wrong.</p>}

    </form>
  );
}
