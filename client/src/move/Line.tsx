import { JSXElement, ParentComponent, Show } from "solid-js";

export const clickableStyle = ' cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900 '

export const Line: ParentComponent<{
  class?: string
  head?: JSXElement
  onClick?: () => void
}> = props => {
  return (
    <div
      class={`bg-white dark:bg-gray-800 flex pl-1 pr-2 border-x ${props.class ?? ''}`}
      classList={{
        [clickableStyle]: !!props.onClick
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

export const LineCustom: ParentComponent<{
  class?: string
}> = props => {
  return (
    <div
      class={`bg-white dark:bg-gray-800 border-x ${props.class ?? ''}`}
    >
      {props.children}
    </div>
  )
}