import { Component, onMount, Show } from "solid-js"
import { ArgumentRecord, AvatarRecord, MoveRecord, StatementRecord } from "../../../shared/types"
import { getPercent } from "../utils"
import { Line } from "./Line"

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
        return ' started a discussion about the following claim:'
      case 'addArgument':
        const { pro } = props.argumentsById[props.move.argument_id!]
        return pro
          ? ' defends 1: ChatGPT-like interfaces will replace most of the Web and mobile apps.'
          : ' attacks 1: ChatGPT-like interfaces will replace most of the Web and mobile apps.'
    }
  }
  const firstInMessage = () => props.messageMoveIndex === 0
  const avatar = () => props.avatarsById[props.move.avatar_id]
  return (
    <>
      <Line head={
        <Show when={firstInMessage()}>
          <div
            innerHTML={avatar().svg}
            class="w-6 h-6"
          />
        </Show>
      }>
        <div class="text-sm mt-0.5">
          <span class="font-bold">
            {avatar().display_name}
          </span>
          <span class="opacity-70">
            {moveTitle()}
          </span>
        </div>
      </Line>
      <Line
        onClick={() => props.onSelectMove(props.move.id)}
        head={
          <div class="font-bold text-center">
            {props.move.conversationMoveIndex + 1}
          </div>
        }
      >
        <span classList={{'font-bold': props.move.type === 'addClaim'}}>{entry().text}
          </span>
        <div class="text-sm opacity-70">
          {scoreTitle[entry().type]}: {getPercent(entry().score)}
        </div>
      </Line>
    </>
  )
}