import { For, type Component } from 'solid-js'
import { A } from '@solidjs/router'

type BreadcrumbItem = { id: number; question: string }

type Props = {
  ancestors: BreadcrumbItem[]
  currentQuestion: string
}

export const BreadcrumbsTab: Component<Props> = (props) => {
  return (
    <nav class="flex flex-col gap-1">
      <A href="/" class="text-green-700 hover:underline font-bold text-lg">Home</A>
      <For each={props.ancestors}>
        {(item) => (
          <A href={`/step/${item.id}`} class="text-green-700 hover:underline">
            {item.question}
          </A>
        )}
      </For>
      <span class="text-gray-700">{props.currentQuestion}</span>
    </nav>
  )
}
