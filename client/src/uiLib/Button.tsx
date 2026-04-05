import { type JSX, splitProps } from 'solid-js'

type Variant = 'primary' | 'secondary' | 'icon' | 'badge'
type Color = 'green' | 'amber' | 'red'
type Size = 'sm' | 'md'

type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  color?: Color
  size?: Size
}

const PRIMARY_COLOR: Record<Color, string> = {
  green: 'bg-green-700 dark:bg-green-600',
  amber: 'bg-amber-700 dark:bg-amber-600',
  red: 'bg-red-700 dark:bg-red-600',
}

const PRIMARY_SIZE: Record<Size, string> = {
  md: 'px-6 py-2',
  sm: 'px-4 py-1.5 text-sm',
}

const PRIMARY_BASE = 'text-white rounded disabled:opacity-50 cursor-pointer'

const SECONDARY_SIZE: Record<Size, string> = {
  md: 'px-5 py-2',
  sm: 'px-4 py-1.5 text-sm',
}

const SECONDARY_BASE = 'border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'

const ICON = 'w-9 h-9 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'

const BADGE_COLOR: Record<Color, string> = {
  green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800',
}

const BADGE_BASE = 'shrink-0 px-2 py-1 text-xs rounded border cursor-pointer'

function getClass(variant: Variant, color: Color, size: Size): string {
  switch (variant) {
    case 'primary': return `${PRIMARY_COLOR[color]} ${PRIMARY_SIZE[size]} ${PRIMARY_BASE}`
    case 'secondary': return `${SECONDARY_SIZE[size]} ${SECONDARY_BASE}`
    case 'icon': return ICON
    case 'badge': return `${BADGE_COLOR[color]} ${BADGE_BASE}`
  }
}

export const Button = (props: Props) => {
  const [local, rest] = splitProps(props, ['variant', 'color', 'size', 'class'])
  const variant = () => local.variant ?? 'primary'
  const color = () => local.color ?? 'green'
  const size = () => local.size ?? 'md'
  const cls = () => [getClass(variant(), color(), size()), local.class].filter(Boolean).join(' ')
  return <button class={cls()} {...rest} />
}
