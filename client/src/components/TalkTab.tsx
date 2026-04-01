import { createSignal, For, Show, type Component } from 'solid-js'
import { trpc } from '../trpc'

type Message = {
  id: number
  body: string
  createdAt: Date | string
  userId: number
  userName: string
}

type Props = {
  messages: Message[] | undefined
  currentUserId: number | undefined
  onSend: (body: string) => Promise<void>
}

export const TalkTab: Component<Props> = (props) => {
  const [body, setBody] = createSignal('')
  const [sending, setSending] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    const text = body().trim()
    if (!text) return
    setSending(true)
    try {
      await props.onSend(text)
      setBody('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div class="flex flex-col gap-4">
      <Show
        when={(props.messages?.length ?? 0) > 0}
        fallback={<p class="text-sm text-gray-400">No messages yet. Be the first to say something.</p>}
      >
        <ul class="flex flex-col gap-3">
          <For each={props.messages}>
            {msg => (
              <li class="flex flex-col gap-1">
                <div class="flex items-baseline gap-2">
                  <span class="text-sm font-medium text-gray-700">{msg.userName}</span>
                  <span class="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p class="text-sm text-gray-800 whitespace-pre-wrap">{msg.body}</p>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <form onSubmit={handleSubmit} class="flex flex-col gap-2">
        <textarea
          class="border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Write a message…"
          value={body()}
          onInput={e => setBody(e.currentTarget.value)}
          disabled={sending()}
        />
        <button
          type="submit"
          disabled={sending() || !body().trim()}
          class="self-end px-4 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending() ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
