import { Component, For } from "solid-js"
import { CardButton } from "../Buttons"

export const CommentButtons: Component<{
  commentIds: number[]
  edgePrefix: string
  openChild: Record<string, string | undefined>
  nodeKey: string
  onChildClick: (edgeKey: string) => void
}> = (props) => (
  <For each={props.commentIds.slice().sort((a, b) => a - b)}>
    {(commentId, i) => {
      const edgeKey = `${props.edgePrefix}:${commentId}`
      return (
        <CardButton
          selected={props.openChild[props.nodeKey] === edgeKey}
          onClick={() => props.onChildClick(edgeKey)}
        >
          💬 {i() + 1}
        </CardButton>
      )
    }}
  </For>
)
