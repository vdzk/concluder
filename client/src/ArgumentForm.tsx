import { Component, createSignal } from "solid-js"
import { IconButton } from "./Buttons"
import { etv } from "./utils"
import { ArgumentFormData } from "../../shared/types"

export const ArgumentForm: Component<{
  saving: boolean
  onSubmitArgument: (a: ArgumentFormData) => void
}> = props => {
  const [pro, setPro] = createSignal(true)
  const [strength, setStrength] = createSignal('50.0')
  const [text, setText] = createSignal('')

  const onSave = () => {
    // TODO: validate user inputs
    props.onSubmitArgument({
      pro: pro(),
      strength: parseFloat(strength()) / 100,
      text: text()
    })
  }

  return (
    <>
      <div class="overflow-hidden border rounded bg-white">
        <div class="flex-1 px-2 py-1 border-b flex">
          <div class="flex-1">
            <select
              class="border rounded py-0.5"
              onChange={etv((strVal) => setPro(strVal === 'true'))}
            >
              <option value="true" selected={pro()}>Pro</option>
              <option value="false" selected={!pro()}>Con</option>
            </select>
          </div>
          <div>
            strength: 
            <input
              type="text"
              class="w-10 border rounded pl-0.5"
              value={strength()}
              onChange={etv(setStrength)}
            /> %
          </div>
        </div>
        <textarea
          rows={3}
          placeholder="Type an argument here..."
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