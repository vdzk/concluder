import { For, type Component } from 'solid-js'
import { BlockItem } from './ui/BlockItem'

type BreadcrumbItem = { id: number; question: string }

type Props = {
  ancestors: BreadcrumbItem[]
  currentQuestion: string
}

export const BreadcrumbsTab: Component<Props> = (props) => {
  return (
    <nav class="flex flex-col gap-2">
      <BlockItem href="/">Home</BlockItem>
      <For each={props.ancestors}>
        {(item) => (
          <BlockItem href={`/step/${item.id}`}>{item.question}</BlockItem>
        )}
      </For>
      <span class="text-gray-700 dark:text-gray-300 px-2 py-1.5">{props.currentQuestion}</span>
    </nav>
  )
}
