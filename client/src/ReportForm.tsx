import { Component, createSignal, Show } from "solid-js"
import { IconButton } from "./Buttons"
import { etv, rpc } from "./utils"

const instructions = {
  'claim': 'e.g. not a true or false statement;  wrong section; typo ',
  'premise': 'e.g. not part of the argument above it; obscene language',
  'pro': "e.g. there is a stronger version of this argument; it's a con instead of a pro; obscene language",
  'con': "e.g. there is a stronger version of this argument; it's a pro instead of a con; obscene language"
}

export const ReportForm: Component<{
  type: 'claim' | 'premise' | 'pro' | 'con',
  id: number
}> = props => {
  const [text, setText] = createSignal('')
  const [saved, setSaved] = createSignal(false)

  const onSave = async () => {
    const _text = text().trim()
    if (_text) {
      await rpc('reportEntry', {
        type: props.type,
        entry_id: props.id,
        text: _text
      })
      setSaved(true)
    }
  }

  return (
    <>
      <Show when={saved()}>
        <div class="text-center opacity-50">
          Report saved ✅
        </div>
      </Show>
      <Show when={!saved()}>
      <div class="overflow-hidden border rounded bg-white dark:bg-gray-800">
        <div class="flex-1 px-2 py-1 border-b flex">
          <div class="flex-1">
            <span class="font-bold text-gray-700 dark:text-gray-300 pr-1">
              Report a problem with the above {props.type}
            </span>
          </div>
        </div>
        <textarea
          rows={3}
          placeholder={instructions[props.type]}
          class="sm:text-lg px-2 py-1 focus:outline-none block w-full dark:bg-gray-800"
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
      </Show>
    </>
  )
}