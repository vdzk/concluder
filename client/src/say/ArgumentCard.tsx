import { Component, createSignal, For, Show } from "solid-js"
import { Card } from "./Card"
import { getPercent } from "../utils"
import { btnClass, CardButton } from "../Buttons"
import { CardProps } from "./cardTypes"
import { CommentCardEditor } from "./CommentCardEditor"
import { CommentButtons } from "./CommentButtons"

export const ArgumentCard: Component<CardProps> = (props) => {
  const arg = () => props.argumentsById[props.id]
  const premIds = () => props.edges.hasPremise[props.id] ?? []
  const commentIds = () => props.edges.argumentHasComment[props.id] ?? []
  const nodeKey = `argument:${props.id}`
  const [editing, setEditing] = createSignal(false)

  const closeChild = () => {
    const open = props.openChild[nodeKey]
    if (open) props.toggleChild(nodeKey, open)
  }

  const onChildClick = (edgeKey: string) => {
    if (editing()) setEditing(false)
    props.toggleChild(nodeKey, edgeKey)
  }

  const onAddCommentClick = () => {
    if (editing()) {
      setEditing(false)
    } else {
      closeChild()
      setEditing(true)
    }
  }

  return (
    <>
      <Card
        topBar={<>
          <div classList={{
            'font-semibold': true,
            'text-green-600': arg()?.pro,
            'text-red-600': !arg()?.pro,
          }}>{arg()?.pro ? 'Pro' : 'Con'}</div>
          <div class="flex-1" />
          <div class="">
            💪 {getPercent(arg()?.strength ?? 0)}
          </div>
        </>}
        text={arg()?.text ?? ''}
      >
        <For each={[]/*premIds()*/}>
          {premId => {
            const edgeKey = `hasPremise:${premId}`
            const s = () => props.statementsById[premId]
            return (
              <CardButton
                selected={props.openChild[nodeKey] === edgeKey}
                onClick={() => onChildClick(edgeKey)}
              >
                ◼️ {getPercent(s()?.likelihood, 0)}
              </CardButton>
            )
          }}
        </For>
        <CommentButtons
          commentIds={commentIds()}
          edgePrefix="argumentHasComment"
          openChild={props.openChild}
          nodeKey={nodeKey}
          onChildClick={onChildClick}
        />
        <CardButton
          selected={editing()}
          onClick={onAddCommentClick}
        >
          💬 add
        </CardButton>
      </Card>
      <Show when={editing()}>
        <CommentCardEditor
          targetKind="argument"
          targetId={props.id}
          onCancel={() => setEditing(false)}
        />
      </Show>
    </>
  )
}