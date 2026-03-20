import { Component, createSignal, For, Show } from "solid-js"
import { Card } from "./Card"
import { getPercent } from "../utils"
import { btnClass, CardButton } from "../Buttons"
import { CardProps } from "./cardTypes"
import { CommentCardEditor } from "./CommentCardEditor"
import { CommentButtons } from "./CommentButtons"

export const StatementCard: Component<CardProps> = (props) => {
  const s = () => props.statementsById[props.id]
  const argIds = () => props.edges.hasArgument[props.id] ?? []
  const commentIds = () => props.edges.statementHasComment[props.id] ?? []
  const nodeKey = `statement:${props.id}`
  const isClaim = () => props.mainClaimId === props.id
  const [editing, setEditing] = createSignal(false)

  const closeChild = () => {
    const open = props.openChild[nodeKey]
    if (open) {
      props.toggleChild(nodeKey, open)
    }
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
        topBar={(
          <>
            <div
              class="font-bold "
              classList={{
                'text-purple-800': isClaim(),
                'text-gray-700': !isClaim()
              }}
            >
              {isClaim() ? 'Claim' : 'Premise'}
            </div>
            <div class="flex-1" />
            <div class="">🎲 {getPercent(s()?.likelihood ?? 0.5)}</div>
          </>
        )
        }
        text={s()?.text ?? ''}
      >
        <For each={argIds()}>
          {argId => {
            const edgeKey = `hasArgument:${argId}`
            const arg = () => props.argumentsById[argId]
            return (
              <CardButton
                selected={props.openChild[nodeKey] === edgeKey}
                onClick={() => onChildClick(edgeKey)}
              >
                {arg()?.pro ? '🟢' : '🔴'} {getPercent(arg()?.strength, 0)}
              </CardButton>
            )
          }}
        </For>
        <CommentButtons
          commentIds={commentIds()}
          edgePrefix="statementHasComment"
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
          targetKind="statement"
          targetId={props.id}
          onCancel={() => setEditing(false)}
        />
      </Show>
    </>
  )
}