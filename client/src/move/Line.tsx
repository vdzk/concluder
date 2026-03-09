import { JSXElement, ParentComponent } from "solid-js";

export const Line: ParentComponent<{
  class?: string
  head?: JSXElement
  onClick?: () => void
}> = props => {
  return (
    <div
      class={`bg-white dark:bg-gray-800 flex px-1 border-x ${props.class ?? ''}`}
      classList={{
        'cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900': !!props.onClick
      }}
      onClick={props.onClick}
    >
      <div class="w-6">
        {props.head}
      </div>
      <div class="flex-1">
        {props.children}
      </div>
    </div>
  )
}