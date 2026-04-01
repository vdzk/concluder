import { type Component } from 'solid-js'
import { A } from '@solidjs/router'

type Props = {
  href: string
}

export const NavButton: Component<Props> = (props) => {
  const isHome = () => props.href === '/'
  return (
    <A
      href={props.href}
      class="flex items-center justify-center w-14 h-14 rounded-full border-2 border-gray-300 text-gray-400 hover:border-green-600 hover:text-green-700 transition-colors self-start"
      aria-label={isHome() ? 'Go home' : 'Go up'}
    >
      {isHome() ? (
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V9.75z" />
        </svg>
      ) : (
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      )}
    </A>
  )
}
