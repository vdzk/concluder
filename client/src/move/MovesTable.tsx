import { useParams } from "@solidjs/router"
import { Accessor, batch, Component, createSignal, For, JSXElement, onMount, Show } from "solid-js"
import { ArgumentRecord, AvatarRecord, MoveRecord, StatementRecord } from "../../../shared/types"
import { createStore } from "solid-js/store"
import { getPercent, indexBy, rpc } from "../utils"
import { clickableStyle } from "./Line"
import { MoveForm } from "./MoveForm"

export const MovesTable: Component = () => {
  const params = useParams()
  const mainClaimId = parseInt(params.id!)
  const [moves, setMoves] = createStore<MoveRecord[]>([])
  const [statementsById, setStatementsById]
    = createStore<Record<number, StatementRecord>>({})
  const [argumentsById, setArgumentsById]
    = createStore<Record<number, ArgumentRecord>>({})
  const [avatarsById, setAvatarsById]
    = createStore<Record<number, AvatarRecord>>({})
  const [selectedMoveIndex, setSelectedMoveIndex]
    = createSignal<number>()
  const [formRefreshKey, setFormRefreshKey] = createSignal(1)

  const reloadTable = async () => {
    const movesData = await rpc('getMoves', { id: mainClaimId })
    batch(() => {
      setMoves(movesData.moves)
      setStatementsById(indexBy(movesData.statements, 'id'))
      setArgumentsById(indexBy(movesData.arguments, 'id'))
      setAvatarsById(indexBy(movesData.avatars, 'id'))
    })
  }

  onMount(reloadTable)

  const getRow = (move: MoveRecord, index: Accessor<number>) => {
    const avatar = avatarsById[move.avatar_id]
    let action = ''
    let target = '1'
    let target_text: JSXElement = 'ChatGPT-like interfaces will replace most of the Web and mobile apps.'
    const statement = statementsById[move.statement_id!]
    const argument = argumentsById[move.argument_id!]
    let entryText = ''
    let certainty = ''
    let strength = ''
    if (move.type === 'addClaim') {
      action = 'Start'
      target = ''
      target_text = <div class="opacity-50 italic">
        Central claim of the debate
      </div>
      entryText = statement.text
      certainty = getPercent(statement.likelihood)
    } else if (move.type === 'addArgument' || move.type === 'addPremiseArgument') {
      action = argument.pro ? 'Defend' : 'Attack'
      entryText = argument.text
      strength = getPercent(argument.strength)
    }
    return (
      <tr>
        <td>{index() + 1}</td>
        <td>
          <div class="flex">
            <div
              innerHTML={avatar.svg}
              class="w-6 h-6"
            />
            {avatar.display_name}
          </div>
        </td>
        <td>
          {action}
        </td>
        <td>
          {target}
        </td>
        <td>
          {target_text}
        </td>
        <td
          class={clickableStyle}
          onClick={() => setSelectedMoveIndex(index())}
        >
          {entryText}
        </td>
        <td>
          {certainty}
        </td>
        <td>
          {strength}
        </td>
      </tr>
    )
  }

  const clearForm = () => {
    batch(() => {
      setSelectedMoveIndex(undefined)
      setFormRefreshKey(n => n + 1)
    })
  }

  return (
    <>
      <table class="bg-white">
        <tbody>
          <tr>
            <th>#</th>
            <th>👤 Author</th>
            <th>Move</th>
            <th>🎯</th>
            <th>Target</th>
            <th>Response</th>
            <th title="certainty">🎲</th>
            <th title="strength">💪</th>
          </tr>
          <For each={moves}>
            {getRow}
          </For>
        </tbody>
      </table>
      <div class="flex-1"/>
      <Show when={formRefreshKey()} keyed>
        <MoveForm
          moveIndex={selectedMoveIndex()}
          {...{
            moves, clearForm, statementsById,
            argumentsById, reloadTable, mainClaimId
          }}  
        />
      </Show>
    </>
  )
}