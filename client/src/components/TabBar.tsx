import { type Component } from 'solid-js'

export type Tab = 'breadcrumbs' | 'history' | 'deps' | 'edit' | 'talk'

const TAB_LABELS: Record<Tab, string> = {
  breadcrumbs: 'Breadcrumbs',
  history: 'History',
  deps: 'Sub-questions',
  edit: 'Edit',
  talk: 'Talk',
}

const TABS: Tab[] = ['breadcrumbs', 'deps', 'talk', 'edit', 'history']

type Props = {
  activeTab: Tab | null
  onToggleTab: (tab: Tab) => void
}

export const TabBar: Component<Props> = (props) => {
  return (
    <div class="flex items-center gap-1 border-b border-gray-200">
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
    </div>
  )
}
