import { Component, Show } from "solid-js"
import { getPercent, getShortNumber } from "./utils"
import { Delta } from "./Delta"
import { A } from "@solidjs/router"

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
  wtp?: number,
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

        <div class="ml-auto font-bold text-gray-700">
          <Show when={props.argument.wtp}>
            <A
              class="hover:underline"
              href={`/wtp/${props.argument.id}`}
              title="willingness to pay estimate"
              target="_blank"
            >
              {getShortNumber(props.argument.wtp!)}$
            </A>
            {' × '}
          </Show>
          <span title={!props.argument.wtp
            ? 'strength of the argument'
            : 'certainty of the consequence'
          }>
            <Show when={props.scoreDelta}>
              <Delta delta={props.scoreDelta!} />
            </Show>
            {getPercent(props.argument.strength)}
          </span>
        </div>
      </div>
      <div class="text-lg px-2 py-1">
        {props.argument.text}
      </div>
    </div>
  )
}