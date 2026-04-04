import { type JSX } from 'solid-js'

type Props = {
  level?: 2 | 3
  children: JSX.Element
}

const CLS = 'text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'

export const SectionHeading = (props: Props) => {
  if ((props.level ?? 2) === 3) return <h3 class={CLS}>{props.children}</h3>
  return <h2 class={CLS}>{props.children}</h2>
}
