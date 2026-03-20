import { Component, JSXElement, Show } from "solid-js"

export const Card: Component<{
  topBar: JSXElement
  text: string
  children?: JSXElement
}> = (props) => (
  <div class="bg-white rounded border overflow-hidden">
    <div class="px-2 py-0.5 border-b  dark:border-gray-700 flex items-center gap-2">
      {props.topBar}
    </div>
    <div class="px-2 py-1 text-lg">
      {props.text}
    </div>
    <Show when={props.children}>
      <div class="border-t flex flex-wrap">
        {props.children}
      </div>
    </Show>
  </div>
)