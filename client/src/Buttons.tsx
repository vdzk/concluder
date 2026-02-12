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

export const IconButton: Component<{
  iconName: string
  onClick: () => void
  label?: string
  disabled?: boolean
}> = props => {
  return (
    <button
      class="px-2 py-2 cursor-pointer hover:bg-orange-200"
      classList={{
        'opacity-30 pointer-events-none': props.disabled
      }}
      onClick={props.onClick}
      title={props.label}
    >
      <img
        class="h-5 w-5"
        src={`/${props.iconName}.svg`}
      />
    </button>
  )
}