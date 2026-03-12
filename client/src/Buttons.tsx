import { Component } from "solid-js";

const hasHoverAndFinePointer =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches

export const btnClass = ` cursor-pointer ${hasHoverAndFinePointer ? 'hover:bg-orange-200 dark:hover:bg-orange-900' : ''}  `

export const IconButton: Component<{
  iconName: string
  onClick: () => void
  label?: string
  disabled?: boolean
}> = props => {

  return (
    <button
      class={"px-2 py-2" + btnClass}
      classList={{
        'opacity-30 pointer-events-none': props.disabled
      }}
      onClick={props.onClick}
      title={props.label}
    >
      <img
        class="h-5 w-5 dark:invert"
        src={`/${props.iconName}.svg`}
      />
    </button>
  )
}

export const TextButton: Component<{
  label: string
  color?: 'red' | 'green' | 'blue' | 'gray'
  onClick: () => void
}> = props => {
  return (
    <button
      onClick={props.onClick}
      class="
        px-2 cursor-pointer text-white rounded
        opacity-75 hover:opacity-100
      "
      classList={{
        'bg-green-700 dark:bg-green-400': props.color === 'green',
        'bg-blue-700 dark:bg-blue-400': props.color === 'blue',
        'bg-red-700 dark:bg-red-400': props.color === 'red',
        'bg-gray-700 dark:bg-gray-400': props.color === 'gray'
      }}
    >
      {props.label}
    </button>
  )
}