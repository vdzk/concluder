import { Component, createSignal } from "solid-js"
import { CardButton } from "../Buttons"
import { rpc } from "../utils"

export const CommentCardEditor: Component<{
  targetKind: 'statement' | 'argument'
  targetId: number
  onCancel: () => void
}> = (props) => {
  const [text, setText] = createSignal('')
  const onSubmit = async () => {
    await rpc('addComment', {
      targetKind: props.targetKind,
      targetId: props.targetId,
      text: text()
    })
    props.onCancel()
  }

  return (
    <div class="bg-white rounded border overflow-hidden">
      <div class="px-2 py-0.5 border-b dark:border-gray-700 flex items-center gap-2">
        <span class="font-semibold text-gray-700">Make a comment</span>
      </div>
      <div class="">
        <textarea
          class="w-full text-lg outline-none px-2 py-1 block"
          rows={5}
          value={text()}
          onInput={e => setText(e.currentTarget.value)}
        />
      </div>
      <div class="border-t flex">
        <CardButton selected={false} onClick={onSubmit}>
          ✅ Submit
        </CardButton>
        <CardButton selected={false} onClick={props.onCancel}>
          ❌ Cancel
        </CardButton>
      </div>
    </div>
  )
}
