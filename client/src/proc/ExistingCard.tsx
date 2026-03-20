import { Component, Show } from "solid-js"
import { Argument, Statement } from "../say/cardTypes"

interface Props {
  type: 'argument' | 'statement'
  entry: Argument | Statement
  localId: number
  isTarget?: boolean
}

export const ExistingCard: Component<Props> = (props) => (
  <div class="border rounded bg-white px-2 py-1">
    <div class="text-xs text-gray-500 font-semibold uppercase mb-1 flex gap-2">
      <span class="font-bold text-black">{props.localId}</span>
      <span>{props.type}</span>
      <Show when={props.isTarget}><span class="text-blue-500">target</span></Show>
    </div>
    <div>{props.entry.text}</div>
  </div>
)
