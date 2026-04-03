import { createEffect, createResource, createSignal, For, Show, type Component } from 'solid-js';
import { A, useSearchParams } from '@solidjs/router';
import { trpc } from '../trpc';

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
            <button
              onClick={() => setTab('featured')}
              class={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer ${tab() === 'featured' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Top Level
            </button>
            <button
              onClick={() => setTab('recent')}
              class={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer ${tab() === 'recent' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Recent
            </button>
            <button
              onClick={() => setTab('messages')}
              class={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer ${tab() === 'messages' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Messages
            </button>
            </div>
          </div>
          <Show when={tab() === 'featured'}>
            <button
              onClick={() => { setFormOpen(v => !v); setStatus('idle'); }}
              class="w-9 h-9 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 text-2xl leading-none cursor-pointer"
              title="Add question"
            >
              +
            </button>
          </Show>
        </div>

        <Show when={tab() === 'featured' && formOpen()}>
          <form onSubmit={handleSubmit} class="flex flex-col gap-3">
            <input
              class="border rounded px-3 py-2 text-sm"
              value={question()}
              onInput={e => setQuestion(e.currentTarget.value)}
              placeholder="Your question…"
              required
              autofocus
            />
            <div class="flex gap-2">
              <button
                type="submit"
                disabled={status() === 'loading'}
                class="bg-green-700 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
              >
                {status() === 'loading' ? 'Submitting…' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => { setFormOpen(false); setStatus('idle'); }}
                class="px-4 py-1.5 rounded text-sm border hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            {status() === 'error' && <p class="text-red-600 text-sm">Something went wrong.</p>}
          </form>
        </Show>

        <Show when={tab() === 'featured'}>
          <ul class="flex flex-col gap-3">
            <For each={featured()} fallback={<li class="text-gray-500">No featured questions yet.</li>}>
              {item => (
                <li>
                  <A href={`/step/${item.id}`} class="block border rounded px-4 py-3 hover:bg-gray-50">
                    <div><span class="font-bold">Q:</span> {item.question}</div>
                    <Show when={item.conclusion}>
                      <div class="mt-1"><span class="font-bold">A:</span> {item.conclusion}</div>
                    </Show>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </Show>

        <Show when={tab() === 'recent'}>
          <ul class="flex flex-col gap-3">
            <For each={recent()} fallback={<li class="text-gray-500">No recent questions yet.</li>}>
              {item => (
                <li>
                  <A href={`/step/${item.id}`} class="block border rounded px-4 py-3 hover:bg-gray-50">
                    <div class="font-medium">{item.question}</div>
                    <div class="text-xs text-gray-500 mt-1">
                      {item.wasEdited ? 'edited' : 'created'} {timeAgo(item.activityAt)} by {item.actorName}
                    </div>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </Show>

        <Show when={tab() === 'messages'}>
          <ul class="flex flex-col gap-3">
            <For each={recentMessages()} fallback={<li class="text-gray-500">No messages yet.</li>}>
              {msg => (
                <li>
                  <A href={`/step/${msg.reasoningStepId}?tab=talk`} class="block border rounded px-4 py-3 hover:bg-gray-50">
                    <div class="text-xs text-gray-500 mb-1 truncate">{msg.stepQuestion}</div>
                    <p class="text-sm text-gray-800 line-clamp-2 whitespace-pre-wrap">{msg.body}</p>
                    <div class="text-xs text-gray-400 mt-1">{msg.userName} · {timeAgo(new Date(msg.createdAt).toISOString())}</div>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>

      {/* Divider */}
      <div class="w-px bg-gray-400 self-stretch" />

      {/* Right column – welcome */}
      <div class="flex flex-col justify-between gap-6 w-1/2 px-10 py-10 overflow-y-auto">
        <div class="flex flex-col gap-4">
          <h1 class="text-3xl font-semibold">Welcome to Concluder</h1>
          <p class="text-gray-600">
            Concluder is a Wikipedia-style tool for collaborative reasoning. Browse questions on the left,
            or add your own to kick off a structured chain of thought. Each question can be broken
            down into sub-questions, analysed, and concluded collaboratively.
          </p>
        </div>
      </div>

    </div>
  )
}
