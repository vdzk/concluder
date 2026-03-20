import { A } from "@solidjs/router";
import { Component, ParentComponent } from "solid-js";

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

type ButtonColor = 'red' | 'green' | 'blue' | 'gray'

const textButtonClass = `
    px-2 cursor-pointer text-white rounded
    opacity-75 hover:opacity-100
  `

const textButtonColorClass: Record<ButtonColor, string> = {
  red: 'bg-red-700',
  green: 'bg-green-700',
  blue: 'bg-blue-700',
  gray: 'bg-gray-700',
}

const getTextButtonColorClass =
  (color?: ButtonColor) => textButtonColorClass[color ?? 'gray']

export const TextButton: Component<{
  label: string
  color?: ButtonColor
  onClick: () => void
}> = props => {
  return (
    <button
      onClick={props.onClick}
      class={textButtonClass}
      classList={{
        [getTextButtonColorClass(props.color)]: true
      }}
    >
      {props.label}
    </button>
  )
}

export const TextButtonLink: Component<{
  label: string
  color?: ButtonColor
  href: string
}> = props => {
  return (
    <A
      href={props.href}
      class={textButtonClass + 'inline-block'}
      classList={{
        [getTextButtonColorClass(props.color)]: true
      }}
    >
      {props.label}
    </A>
  )
}

export const CardButton: ParentComponent<{
  selected: boolean
  onClick: () => void
}> = props => {
  return (
    <button
      class={"px-2 pt-0.5 border-b-3" + btnClass}
      classList={{
        'border-b-transparent': !props.selected
      }}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}