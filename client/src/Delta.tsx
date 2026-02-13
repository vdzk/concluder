import { Component, Show } from "solid-js";
import { getPercent } from "./utils";

export const Delta: Component<{
  old: number,
  new: number
}> = props => {
  const delta = () => props.new - props.old
  return (
    <span
      class="inline-block px-1"
      classList={{
        'text-green-700': delta()! > 0,
        'text-red-700': delta()! < 0
      }}
    >
      <Show when={delta()! > 0}>+</Show>
      {getPercent(delta()!)}
    </span>
  )
}