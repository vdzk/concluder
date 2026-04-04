import { type JSX, splitProps } from 'solid-js'

type Props = JSX.InputHTMLAttributes<HTMLInputElement> & { class?: string }

export const Input = (props: Props) => {
  const [local, rest] = splitProps(props, ['class'])
  const cls = () => ['border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-800 focus:outline-none', local.class].filter(Boolean).join(' ')
  return <input class={cls()} {...rest} />
}
