import { createEffect, createResource, createSignal, For, Show, type Component } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { BlockItem } from '../components/ui/BlockItem';
import { trpc } from '../trpc';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { TabButton } from '../components/ui/TabButton';

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

export const Home: Component = () => {
  const [question, setQuestion] = createSignal('');
  const [status, setStatus] = createSignal<'idle' | 'loading' | 'error'>('idle');
  const [formOpen, setFormOpen] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams<{ tab?: string }>();
  const tab = () => searchParams.tab === 'recent' ? 'recent' : searchParams.tab === 'messages' ? 'messages' : 'featured';
  const setTab = (t: 'featured' | 'recent' | 'messages') => setSearchParams({ tab: t });
  const [featured, { refetch }] = createResource(() => trpc.featured.list.query());
  const [recent] = createResource(() => trpc.recent.list.query());
  const [recentMessages] = createResource(() => trpc.talkMessage.recent.query());
  createEffect(() => { document.title = 'Concluder | Home'; })

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await trpc.featured.submit.mutate({ question: question() });
      setQuestion('');
      setStatus('idle');
      setFormOpen(false);
      refetch();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div class="flex h-full">

      {/* Left column – questions */}
      <div class="flex flex-col gap-6 w-1/2 px-10 py-10 overflow-y-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold">Questions</h2>
            <div class="flex gap-1">
              <TabButton active={tab() === 'featured'} onClick={() => setTab('featured')}>Top Level</TabButton>
              <TabButton active={tab() === 'recent'} onClick={() => setTab('recent')}>Recent</TabButton>
              <TabButton active={tab() === 'messages'} onClick={() => setTab('messages')}>Messages</TabButton>
            </div>
          </div>
          <Show when={tab() === 'featured'}>
            <Button variant="icon" onClick={() => { setFormOpen(v => !v); setStatus('idle'); }} title="Add question">
              +
            </Button>
          </Show>
        </div>

        <Show when={tab() === 'featured' && formOpen()}>
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
              <Button type="button" variant="secondary" size="sm" onClick={() => { setFormOpen(false); setStatus('idle'); }}>
                Cancel
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
                    <div><span class="font-bold">Q:</span> {item.question}</div>
                    <Show when={item.conclusion}>
                      <div class="mt-1"><span class="font-bold">A:</span> {item.conclusion}</div>
                    </Show>
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
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.wasEdited ? 'edited' : 'created'} {timeAgo(item.activityAt)} by {item.actorName}
                    </div>
                  </BlockItem>
                </li>
              )}
            </For>
          </ul>
        </Show>

        <Show when={tab() === 'messages'}>
          <ul class="flex flex-col gap-2">
            <For each={recentMessages()} fallback={<EmptyState as="li" message="No messages yet." />}>
              {msg => (
                <li>
                  <BlockItem href={`/step/${msg.reasoningStepId}?tab=talk`}>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{msg.stepQuestion}</div>
                    <p class="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 whitespace-pre-wrap">{msg.body}</p>
                    <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">{msg.userName} · {timeAgo(new Date(msg.createdAt).toISOString())}</div>
                  </BlockItem>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>

      {/* Divider */}
      <div class="w-px bg-gray-400 dark:bg-gray-600 self-stretch" />

      {/* Right column – welcome */}
      <div class="flex flex-col justify-between gap-6 w-1/2 px-10 py-10 overflow-y-auto">
        <div class="flex flex-col gap-4">
          <h1 class="text-3xl font-semibold">Welcome to Concluder</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Concluder is a Wikipedia-style tool for collaborative reasoning. Browse questions on the left,
            or add your own to kick off a structured chain of thought. Each question can be broken
            down into sub-questions, analysed, and concluded collaboratively.
          </p>
        </div>
      </div>

    </div>
  )
}
