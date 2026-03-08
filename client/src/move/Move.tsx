import { Component, onMount, Show } from "solid-js";
import { ArgumentRecord, AvatarRecord, MoveRecord, StatementRecord } from "../../../shared/types";
import { IconButton } from "../Buttons";
import { getPercent } from "../utils";
import { statementScoreTitle } from "../argue/Statement";
import { argumentScoreTitle } from "../argue/Argument";

const moveTitle: Record<string, string> = {
  addClaim: 'made a claim',
  addArgument: 'argued for it'
}
const scoreTitle: Record<string, string> = {
  statement: statementScoreTitle,
  argument: argumentScoreTitle
}

export const Move: Component<{
  moveIndex: number
  move: MoveRecord
  statementsById: Record<number, StatementRecord>
  argumentsById: Record<number, ArgumentRecord>
  avatarsById: Record<number, AvatarRecord>
  onActionClick: (action?: string, moveId?: number) => void
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
    } else if (props.move.argument_id) {
      const argument = props.argumentsById[props.move.argument_id]
      return {
        text: argument.text,
        score: argument.strength,
        type: 'argument'
      }
    }
  }
  const avatarSvg = () => props.avatarsById[props.move.avatar_id].svg
  const moveTitle = () => {
    switch (props.move.type) {
      case 'addClaim':
        return 'made a claim'
      case 'addArgument':
        const { pro } = props.argumentsById[props.move.argument_id!]
        return `argued ${pro ? 'for' : 'against'} it`
    }
  }
  return (
      <>
        <div class="flex items-center">
          <div innerHTML={avatarSvg()} class="w-6 h-6 -ml-0.5 mr-0.5" />
          {moveTitle()}
        </div>
        <div class="border rounded bg-white dark:bg-gray-800 px-2 py-1 sm:text-lg">
          <span class="font-bold">
            [{props.moveIndex + 1}] 
          </span>
          {entry()?.text}
        </div>
        <div class="flex items-center">
          <div class="flex-1" />
          <Show when={entry()}>
            <div
              class="ml-auto font-bold text-gray-700 dark:text-gray-300 px-1"
              title={scoreTitle[entry()!.type]}
            >
              {getPercent(entry()!.score)}
            </div>
          </Show>
          <IconButton
            label="Attack"
            onClick={() => props.onActionClick('attack', props.move.id)}
            iconName="sword"
          />
          <IconButton
            label="Defend"
            onClick={() => props.onActionClick('defend', props.move.id)}
            iconName="shield"
          />
        </div>
      </>
  )
}