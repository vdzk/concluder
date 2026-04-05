import { createResource, createSignal, For, Show, type Component } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { BlockItem } from '../../uiLib/BlockItem';
import { trpc } from '../../trpc';
import { Button } from '../../uiLib/Button';
import { EmptyState } from '../../uiLib/EmptyState';
import { Input } from '../../uiLib/Input';
import { TabButton } from '../../uiLib/TabButton';
import { Text, TextBlock } from '../../uiLib/Text';

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export const HomeLeftColumn: Component = () => {
  const [question, setQuestion] = createSignal('');
  const [status, setStatus] = createSignal<'idle' | 'loading' | 'error'>('idle');
  const [searchParams, setSearchParams] = useSearchParams<{ tab?: string }>();
  const tab = () => searchParams.tab === 'recent' ? 'recent' : searchParams.tab === 'new' ? 'new' : 'featured';
  const setTab = (t: 'featured' | 'recent' | 'new') => setSearchParams({ tab: t });
  const [featured, { refetch }] = createResource(() => trpc.featured.list.query());
  const [recent] = createResource(() => trpc.recent.list.query());

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await trpc.featured.submit.mutate({ question: question() });
      setQuestion('');
      setStatus('idle');
      setTab('featured');
      refetch();
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex gap-1">
            <TabButton active={tab() === 'featured'} onClick={() => setTab('featured')}>Conclusions</TabButton>
            <TabButton active={tab() === 'recent'} onClick={() => setTab('recent')}>Recent edits</TabButton>
            <TabButton active={tab() === 'new'} onClick={() => { setStatus('idle'); setTab('new'); }}>Start a new topic</TabButton>
          </div>
        </div>
      </div>

      <Show when={tab() === 'new'}>
        <form onSubmit={handleSubmit} class="flex flex-col gap-3">
          <Input
            value={question()}
            onInput={e => setQuestion(e.currentTarget.value)}
            placeholder="Your question…"
            required
            autofocus
          />
          <div class="flex gap-2">
            <Button type="submit" size="sm" disabled={status() === 'loading'}>
              {status() === 'loading' ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
          {status() === 'error' && <p class="text-red-600 dark:text-red-400 text-sm">Something went wrong.</p>}
        </form>
      </Show>

      <Show when={tab() === 'featured'}>
        <ul class="flex flex-col gap-2">
          <For each={featured()} fallback={<EmptyState as="li" message="No featured questions yet." />}>
            {item => (
              <li>
                <BlockItem href={`/step/${item.id}`}>
                  {item.conclusion ?? item.question}
                </BlockItem>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={tab() === 'recent'}>
        <ul class="flex flex-col gap-2">
          <For each={recent()} fallback={<EmptyState as="li" message="No recent questions yet." />}>
            {item => (
              <li>
                <BlockItem href={`/step/${item.id}`}>
                  <div>{item.question}</div>
                  <TextBlock size="xs" color="muted" class="mt-1">
                    {item.wasEdited ? 'edited' : 'created'} {timeAgo(item.activityAt)} by {item.actorName}
                  </TextBlock>
                </BlockItem>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
};
