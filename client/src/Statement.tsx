import { Component, Show } from "solid-js"
import { getPercent } from "./utils"
import { Step } from "./Argue"
import { ArgumentDataRow } from "./Argument"
import { Delta } from "./Delta"

export interface StatementDataRow {
  id: number,
  text: string,
  likelihood: number,
  hasArgument: boolean,
  arguments?: ArgumentDataRow[],
  editable: boolean | null
}

export const Statement: Component<{
  step: Step
  statement: StatementDataRow
  scoreDelta?: number
  parentPremiseIndex?: number
}> = props => {

  return (
    <div class="overflow-hidden border rounded bg-white">
      <div class="flex-1 px-2 py-1 border-b flex">
        <span
          class="font-bold inline-block pr-1"
          classList={{
            'text-purple-700': props.step.isClaim,
            'text-gray-700': !props.step.isClaim
          }}
        >
          {props.step.isClaim ? 'Claim' : 'Premise'}
          {' '}
          {props.parentPremiseIndex !== undefined ? props.parentPremiseIndex + 1 : ''}
        </span>
        <div
          class="ml-auto font-bold text-gray-700"
          title="confidence in this statement"
        >
          <Show when={props.scoreDelta}>
            <Delta delta={props.scoreDelta!} />
          </Show>
          {getPercent(props.statement.likelihood)}
        </div>
      </div>
      <div class="text-lg px-2 py-1">
        {props.statement.text}
      </div>
    </div>
  )
}