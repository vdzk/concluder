import { createSignal, type Component } from 'solid-js';
import { Button } from '../../uiLib/Button';
import { Text, TextBlock } from '../../uiLib/Text';
import { Input } from '../../uiLib/Input';
import { Textarea } from '../../uiLib/Textarea';

type Values = { term: string; text: string };

type Props = {
  initialValues?: Values;
  onSubmit: (values: Values) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
};

export const DefinitionEditForm: Component<Props> = (props) => {
  const [term, setTerm] = createSignal(props.initialValues?.term ?? '');
  const [text, setText] = createSignal(props.initialValues?.text ?? '');
  const [status, setStatus] = createSignal<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await props.onSubmit({ term: term(), text: text() });
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} class="flex flex-col gap-4">
      <TextBlock size="xl" bold>Edit Definition</TextBlock>

      <label class="flex flex-col gap-1">
        <Text bold>Term</Text>
        <Input value={term()} onInput={e => setTerm(e.currentTarget.value)} required />
      </label>

      <label class="flex flex-col gap-1">
        <Text bold>Definition</Text>
        <Textarea class="min-h-24" rows={10} value={text()} onInput={e => setText(e.currentTarget.value)} required />
      </label>

      <div class="flex gap-3">
        <Button type="submit" disabled={status() === 'loading'}>
          {status() === 'loading' ? 'Saving…' : (props.submitLabel ?? 'Save')}
        </Button>
        {props.onCancel && (
          <Button type="button" variant="secondary" onClick={props.onCancel}>Cancel</Button>
        )}
      </div>

      {status() === 'error' && <p class="text-red-600 dark:text-red-400">Something went wrong.</p>}
    </form>
  );
}
