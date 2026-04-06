import { type Component } from 'solid-js'
import { A } from '@solidjs/router'

export type Tab = 'breadcrumbs' | 'history' | 'deps' | 'edit' | 'talk'

const TAB_LABELS: Record<Tab, string> = {
  breadcrumbs: 'Breadcrumbs',
  history: 'History',
  deps: 'Sub-questions',
  edit: '✏️ Edit',
  talk: 'Talk',
}

const TABS: Tab[] = ['breadcrumbs', 'deps', 'talk', 'edit', 'history']

type Props = {
  activeTab: Tab | null
  onToggleTab: (tab: Tab) => void
}

const BASE_TAB_CLASS = 'px-3 py-2 text-sm border-b-2 -mb-px transition-colors'
const INACTIVE_TAB_CLASS = 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'

export const TabBar: Component<Props> = (props) => {
  return (
    <div class="flex flex-wrap items-center gap-1 border-b border-gray-200 dark:border-gray-700">
      <A
        href="/"
        class={`${BASE_TAB_CLASS} ${INACTIVE_TAB_CLASS}`}
      >
        Home
      </A>
      {TABS.map(tab => (
        <button
          class={`${BASE_TAB_CLASS} cursor-pointer ${
            props.activeTab === tab
              ? 'border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 font-medium'
              : INACTIVE_TAB_CLASS
          }`}
          onClick={() => props.onToggleTab(tab)}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
      <A
        href="/definitions"
        class={`${BASE_TAB_CLASS} ${INACTIVE_TAB_CLASS}`}
      >
        Definitions
      </A>
    </div>
  )
}
