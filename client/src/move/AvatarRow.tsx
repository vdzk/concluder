import { Component, JSXElement } from "solid-js"

export const AvatarRow: Component<{ svg: string; name: string; label: JSXElement }> = (props) => (
  <div class="flex items-center gap-2 text-lg">
    <div innerHTML={props.svg} class="w-8 h-8" />
    <span>{props.name}</span>
    <span>{props.label}</span>
  </div>
)
