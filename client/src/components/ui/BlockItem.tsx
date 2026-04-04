import { type JSX, splitProps, type Component } from 'solid-js'
import { A } from '@solidjs/router'

type BaseProps = {
  class?: string
  children?: JSX.Element
}

type LinkProps = BaseProps & { href: string } & Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>
type ButtonProps = BaseProps & { href?: never } & JSX.ButtonHTMLAttributes<HTMLButtonElement>

type Props = LinkProps | ButtonProps

const BASE = 'block px-2 py-1.5 rounded border border-transparent border-l-black dark:border-l-white hover:border-black dark:hover:border-white'
const BUTTON_EXTRA = 'w-full text-left cursor-pointer'

export const BlockItem: Component<Props> = (props) => {
  const [local, rest] = splitProps(props, ['href', 'class'])
  const cls = () => [BASE, !local.href ? BUTTON_EXTRA : '', local.class].filter(Boolean).join(' ')

  if (local.href !== undefined) {
    return <A href={local.href} class={cls()} {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
  }
  return <button type="button" class={cls()} {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} />
}
