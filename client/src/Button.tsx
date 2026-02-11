import { Component } from "solid-js";

export const Button: Component<{
  label: string
  onClick: () => void
}> = props => {
  return (
    <button
      class="rounded-lg px-2 inline-block cursor-pointer bg-yellow-400 text-gray-900 hover:bg-yellow-500"
      onClick={props.onClick}
    >
      {props.label}
    </button>
  )
}