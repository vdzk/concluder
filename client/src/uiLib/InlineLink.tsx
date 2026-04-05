import { type JSX } from 'solid-js'
import { A } from '@solidjs/router'

type Variant = 'external' | 'dep' | 'def' | 'nav'

type Props = {
  variant: Variant
  href: string
  children: JSX.Element
}

const CLASS: Record<Variant, string> = {
  external: 'underline decoration-blue-400 dark:decoration-blue-500 decoration-2 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded px-0.5',
  dep: 'underline decoration-green-400 dark:decoration-green-500 decoration-2 text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded px-0.5',
  def: 'underline decoration-amber-400 dark:decoration-amber-500 decoration-2 text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded px-0.5',
  nav: 'underline decoration-gray-400 dark:decoration-gray-500 decoration-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-0.5',
}

export const InlineLink = (props: Props) => {
  if (props.variant === 'external') {
    return (
      <a href={props.href} target="_blank" rel="noopener noreferrer" class={CLASS.external}>
        {props.children}
      </a>
    )
  }
  return <A href={props.href} class={CLASS[props.variant]}>{props.children}</A>
}
