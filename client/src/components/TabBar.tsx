import { Show, type Component } from 'solid-js'

export type Tab = 'history' | 'deps' | 'new-dep' | 'edit'

const TAB_LABELS: Record<Tab, string> = {
  history: 'History',
  deps: 'Dependencies',
  'new-dep': 'New dependency',
  edit: 'Edit',
}

const TABS: Tab[] = ['history', 'deps', 'new-dep', 'edit']

type Props = {
  open: boolean
  onToggleOpen: () => void
  activeTab: Tab | null
  onToggleTab: (tab: Tab) => void
}

export const TabBar: Component<Props> = (props) => {
  return (
    <div class={`flex items-center gap-1 ${props.open ? 'border-b border-gray-200' : ''}`}>
      <button
        class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 text-gray-400 hover:border-green-600 hover:text-green-700 transition-colors cursor-pointer mr-2 shrink-0"
        onClick={props.onToggleOpen}
        aria-label={props.open ? 'Close menu' : 'Open menu'}
      >
        <svg
          class={`w-5 h-5 transition-transform duration-200 ${props.open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <Show when={props.open}>
        {TABS.map(tab => (
          <button
            class={`px-3 py-2 text-sm cursor-pointer border-b-2 -mb-px transition-colors ${
              props.activeTab === tab
                ? 'border-green-600 text-green-700 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => props.onToggleTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}

      </Show>
    </div>
  )
}
