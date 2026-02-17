import { Component, Show } from "solid-js"
import { getPercent } from "./utils"
import { Delta } from "./Delta"

export interface Premise {
  id: number
  argument_id: number
  statement_id: number
  invert: boolean
}

export interface ArgumentDataRow {
  id: number,
  claim_id: number,
  text: string,
  pro: boolean,
  strength: number,
  hasPremise: boolean,
  editable: boolean,
  premises?: Premise[]
}

export const Argument: Component<{
  argument: ArgumentDataRow
  scoreDelta?: number
  sideIndex: number
}> = props => {

  return (
    <div class="overflow-hidden border rounded bg-white">
      <div class="flex-1 px-2 py-1 border-b flex">
        <span
          class="font-bold inline-block pr-1"
          classList={{
            'text-green-700': props.argument.pro,
            'text-red-700': !props.argument.pro
          }}
        >
          {props.argument.pro ? 'Pro' : 'Con'}
          {' '}
          {props.sideIndex + 1}
        </span>

        <div
          class="ml-auto font-bold text-gray-700"
          title="strength of the argument"
        >
          <Show when={props.scoreDelta}>
            <Delta delta={props.scoreDelta!} />
          </Show>
          {getPercent(props.argument.strength)}
        </div>
      </div>
      <div class="text-lg px-2 py-1">
        {props.argument.text}
      </div>
    </div>
  )
}