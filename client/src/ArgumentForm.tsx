import { Component, createSignal, onMount } from "solid-js"
import { IconButton } from "./Buttons"
import { etv } from "./utils"

export const ArgumentForm: Component<{
  saving: boolean
  onSubmitArgument: (text: string) => void
}> = props => {
  const [newArgumentText, setNewArgumentText] = createSignal('')
  let textareaRef: HTMLTextAreaElement | undefined

  onMount(() => {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        textareaRef?.focus()
      })
    })
  })

  return (
    <>
      <div class="overflow-hidden border rounded bg-white">
        <div class="flex-1 px-2 py-1 border-b flex">
          <span class="font-bold text-gray-700 pr-1">
            New argument
          </span>
        </div>
        <textarea
          ref={textareaRef}
          rows={3}
          placeholder="type here..."
          class="text-lg px-2 py-1 focus:outline-none block w-full"
          onChange={etv(setNewArgumentText)}
          value={newArgumentText()}
        />
      </div>
      <div class="flex select-none">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          label="save"
          iconName="save"
          onClick={() => props.onSubmitArgument(newArgumentText())}
        />
      </div>
    </>
  )
}