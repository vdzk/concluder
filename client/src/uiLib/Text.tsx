import { type JSX, splitProps } from 'solid-js'

type Size = 'xs' | 'base' | 'lg' | 'xl'

type Props = {
  size?: Size
  color?: 'muted'
  bold?: boolean
  class?: string
  children?: JSX.Element
  [key: string]: unknown
}

const sizes: Record<Size, string> = {
  xs: 'text-xs',
  base: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl',
}

function cls(props: Props) {
  return [
    sizes[props.size ?? 'base'],
    props.color === 'muted' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200',
    props.bold ? 'font-semibold' : undefined,
    props.class,
  ].filter(Boolean).join(' ')
}

export const Text = (props: Props) => {
  const [local, rest] = splitProps(props, ['size', 'color', 'bold', 'class'])
  return <span class={cls(local)} {...rest} />
}

export const TextBlock = (props: Props) => {
  const [local, rest] = splitProps(props, ['size', 'color', 'bold', 'class'])
  return <div class={cls(local)} {...rest} />
}
