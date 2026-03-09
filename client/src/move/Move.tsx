import { Component, onMount, Show } from "solid-js"
import { ArgumentRecord, AvatarRecord, MoveRecord, StatementRecord } from "../../../shared/types"
import { getPercent } from "../utils"
import { Line } from "./Line"
import { CutGap } from "./CutGap"

const scoreTitle: Record<string, string> = {
  statement: 'Certainty',
  argument: 'Strength'
}

export const Move: Component<{
  move: MoveRecord & { conversationMoveIndex: number }
  statementsById: Record<number, StatementRecord>
  argumentsById: Record<number, ArgumentRecord>
  avatarsById: Record<number, AvatarRecord>
  onSelectMove: (moveId: number) => void
  selected: boolean
  messageMoveIndex: number
}> = props => {
  onMount(() => {
    if (props.move.type === 'addClaim') {
      document.title = props.statementsById[props.move.statement_id!].text
    }
  })
  const entry = () => {
    if (props.move.statement_id) {
      const statement = props.statementsById[props.move.statement_id]
      return {
        text: statement.text,
        score: statement.likelihood,
        type: 'statement'
      }
    } else {
      const argument = props.argumentsById[props.move.argument_id!]
      return {
        text: argument.text,
        score: argument.strength,
        type: 'argument'
      }
    }
  }
  const moveTitle = () => {
    switch (props.move.type) {
      case 'addClaim':
        return 'It is said that'
      case 'addArgument':
        const { pro } = props.argumentsById[props.move.argument_id!]
        return pro ? 'This is because' : 'On the other hand'
    }
  }
  const firstInMessage = () => props.messageMoveIndex === 0
  const firstInConversation = () => props.move.conversationMoveIndex === 0
  return (
    <>
      <Show when={firstInMessage() && !firstInConversation()}>
        <Line class="h-2" />
        <div class="border-t" />
        <Line class="h-2" />
      </Show>
      <Line head={
        <Show when={firstInMessage()}>
          <div
            innerHTML={props.avatarsById[props.move.avatar_id].svg}
            class="w-6 h-6"
            // classList={{
            //   'invisible': props.selected
            // }}
          />
        </Show>
      }>
        <div
          class="text-sm opacity-70 mt-0.5"
          // classList={{
          //   'invisible': props.selected
          // }}
        >
          {moveTitle()}...
        </div>
      </Line>
      <Show when={props.selected}>
        <CutGap />
      </Show>
      <Line
        onClick={() => props.onSelectMove(props.move.id)}
        head={
          <div class="font-bold text-center">
            {props.move.conversationMoveIndex + 1}
          </div>
        }
      >
        {entry().text}
        <div class="text-sm opacity-70">
          {scoreTitle[entry().type]}: {getPercent(entry().score)}
        </div>
      </Line>
    </>
  )
}