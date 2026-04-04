import { createSignal, For, Show, type Component } from 'solid-js'
import { trpc } from '../trpc'
import { Button } from './ui/Button'
import { EmptyState } from './ui/EmptyState'
import { Textarea } from './ui/Textarea'

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
        fallback={<EmptyState size="sm" message="No messages yet. Be the first to say something." />}
      >
        <ul class="flex flex-col gap-3">
          <For each={props.messages}>
            {msg => (
              <li class="flex flex-col gap-1">
                <div class="flex items-baseline gap-2">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{msg.userName}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{msg.body}</p>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <form onSubmit={handleSubmit} class="flex flex-col gap-2">
        <Textarea
          class="text-sm resize-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Write a message…"
          value={body()}
          onInput={e => setBody(e.currentTarget.value)}
          disabled={sending()}
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending() || !body().trim()}
          class="self-end transition-colors"
        >
          {sending() ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </div>
  )
}
