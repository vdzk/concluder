import { Component, Show } from "solid-js";
import { getPercent } from "./utils";

export const Delta: Component<{
  delta: number
}> = props => {
  return (
    <span
      class="inline-block px-1"
      classList={{
        'text-green-700': props.delta > 0,
        'text-red-700': props.delta < 0
      }}
    >
      <Show when={props.delta > 0}>+</Show>
      {getPercent(props.delta)}
    </span>
  )
}