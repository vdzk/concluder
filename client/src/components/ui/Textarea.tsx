import { type JSX, splitProps } from 'solid-js'

type Props = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & { class?: string }

export const Textarea = (props: Props) => {
  const [local, rest] = splitProps(props, ['class'])
  const cls = () => ['border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-800 focus:outline-none', local.class].filter(Boolean).join(' ')
  return <textarea class={cls()} {...rest} />
}
