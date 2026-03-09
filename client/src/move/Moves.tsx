import { useParams } from "@solidjs/router"
import { batch, Component, createSignal, For, onMount, Show } from "solid-js"
import { indexBy, rpc } from "../utils"
import { createStore } from "solid-js/store"
import { ArgumentRecord, AvatarRecord, MoveRecord, StatementRecord } from "../../../shared/types"
import { Move } from "./Move"
import { MoveEditor } from "./MoveEditor"
import { Line } from "./Line"

interface Message {
  avatarId: number,
  moves: (MoveRecord & { conversationMoveIndex: number })[]
}

export const Moves: Component = () => {
  const params = useParams()
  const mainClaimId = parseInt(params.id!)
  const [messages, setMessages] = createStore<Message[]>([])
  const [movesById, setMovesById] = createStore<Record<number, MoveRecord>>([])
  const [statementsById, setStatementsById] = createStore<Record<number, StatementRecord>>({})
  const [argumentsById, setArgumentsById] = createStore<Record<number, ArgumentRecord>>({})
  const [avatarsById, setAvatarsById] = createStore<Record<number, AvatarRecord>>({})
  const [selectedMoveId, setSelectedMoveId] = createSignal<number>()

  onMount(async () => {
    const movesData = await rpc('getMoves', { id: mainClaimId })
    batch(() => {
      const messages: Message[] = []
      let message: Message | null = null
      let conversationMoveIndex = 0
      for (const move of movesData.moves) {
        if (!message || move.avatar_id !== message.avatarId) {
          message = {
            avatarId: move.avatar_id,
            moves: []
          }
          messages.push(message)
        }
        move.conversationMoveIndex = conversationMoveIndex
        conversationMoveIndex++
        message.moves.push(move)
      }
      setMessages(messages)
      setMovesById(indexBy(movesData.moves, 'id'))
      setStatementsById(indexBy(movesData.statements, 'id'))
      setArgumentsById(indexBy(movesData.arguments, 'id'))
      setAvatarsById(indexBy(movesData.avatars, 'id'))
    })
  })

  const onSelectMove = (moveId: number) => {
    setSelectedMoveId(prev => prev === moveId ? undefined : moveId)
  }

  const onSave = () => {
    setSelectedMoveId()
  }

  const onCancel = () => {
    setSelectedMoveId()
  }

  return (
    <div class="[scrollbar-gutter:stable] overflow-y-auto">
      <main class="w-xl max-w-full mx-auto overflow-hidden mt-5">
        <Line class="h-2 border-t rounded-t" />
        <For each={messages}>
          {message => (
            <For each={message.moves}>
              {(move, index) => (
                <>
                  <Move
                    {...{
                      move, onSelectMove,
                      statementsById, argumentsById, avatarsById
                    }}
                    selected={selectedMoveId() === move.id}
                    messageMoveIndex={index()}
                  />
                  <Show when={selectedMoveId() === move.id}>
                    <MoveEditor
                      {...{ onSave, onCancel, mainClaimId }}
                      targetMove={movesById[selectedMoveId()!]}
                    />
                  </Show>
                </>
              )}
            </For>
          )}
        </For>
        <Line class="h-2 border-b rounded-b" />
      </main>
    </div>
  )
}