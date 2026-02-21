import { Component, createSignal, onMount } from "solid-js"
import { IconButton } from "./Buttons"
import { etv } from "./utils"

export const ClaimForm: Component<{
  saving: boolean
  onSubmitClaim: (text: string) => void
}> = props => {
  let textareaRef: HTMLTextAreaElement | undefined
  const [text, setText] = createSignal('')

  onMount(() => {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        textareaRef?.focus()
      })
    })
  })

  const onSave = () => {
    const _text = text().trim()
    if (_text) {
      props.onSubmitClaim(_text)
    }
  }

  return (
    <>
      <div class="overflow-hidden border rounded bg-white">
        <div class="flex-1 px-2 py-1 border-b flex">
          <div class="flex-1">
            <span class="font-bold text-gray-700 pr-1">
              New claim
            </span>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          rows={2}
          placeholder="Type here..."
          class="sm:text-lg px-2 py-1 focus:outline-none block w-full"
          onChange={etv(setText)}
          value={text()}
        />
      </div>
      <div class="flex select-none">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          label="save"
          iconName="save"
          onClick={onSave}
        />
      </div>
    </>
  )
}