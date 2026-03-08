import { useParams } from "@solidjs/router";
import { batch, Component, createSignal, For, onMount, Show } from "solid-js";
import { indexBy, rpc } from "../utils";
import { createStore } from "solid-js/store";
import { ArgumentRecord, AvatarRecord, MoveRecord, StatementRecord } from "../../../shared/types";
import { Move } from "./Move";
import { MoveEditor } from "./MoveEditor";

export const Moves: Component = () => {
  const params = useParams()
  const mainClaimId = parseInt(params.id!)
  const [moves, setMoves] = createStore<MoveRecord[]>([])
  const [movesById, setMovesById] = createStore<Record<number, MoveRecord>>([])
  const [statementsById, setStatementsById] = createStore<Record<number, StatementRecord>>({})
  const [argumentsById, setArgumentsById] = createStore<Record<number, ArgumentRecord>>({})
  const [avatarsById, setAvatarsById] = createStore<Record<number, AvatarRecord>>({})
  const [editing, setEditing] = createSignal(false)
  const [editingPro, setEditingPro] = createSignal<boolean>()
  const [targetMoveId, setTargetMoveId] = createSignal<number>()

  onMount(async () => {
    const movesData = await rpc('getMoves', { id: mainClaimId })
    batch(() => {
      // CONTINUE HERE!
      // CONTINUE HERE!
      // CONTINUE HERE!
      // CONTINUE HERE!
      // TODO: add moveIndex inside moves store so that targetMove contains it

      setMoves(movesData.moves)
      setMovesById(indexBy(movesData.moves, 'id'))
      setStatementsById(indexBy(movesData.statements, 'id'))
      setArgumentsById(indexBy(movesData.arguments, 'id'))
      setAvatarsById(indexBy(movesData.avatars, 'id'))
    })
  })

  const onActionClick = (action?: string, moveId?: number) => {
    setEditingPro(action === 'defend')
    setTargetMoveId(moveId)
    setEditing(true)
  }

  const onSave = () => {
    setEditing(false)
  }

  const onCancel = () => {
    setEditing(false)
  }

  return (
    <div class="[scrollbar-gutter:stable] h-dvh overflow-y-auto">
      <main class="w-lg max-w-full mx-auto pb-16 px-1 pt-4">
        <For each={moves}>
          {(move, index) => (
            <>
              <Move
                moveIndex={index()}
                {...{
                  move, onActionClick,
                  statementsById, argumentsById, avatarsById
                }}
              />
              <Show when={editing() && targetMoveId() === move.id}>
                <MoveEditor
                  pro={editingPro()}
                  {...{ onSave, onCancel, mainClaimId }}
                  targetMove={movesById[targetMoveId()!]}
                />
              </Show>
            </>)}
        </For>
      </main>
    </div>
  )
}