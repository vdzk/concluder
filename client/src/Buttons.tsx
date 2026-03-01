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