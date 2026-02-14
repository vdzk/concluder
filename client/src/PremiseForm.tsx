import { Component, createSignal } from "solid-js"
import { IconButton } from "./Buttons"
import { etv } from "./utils"
import { PremiseFormData } from "../../shared/types"

export const PremiseForm: Component<{
  saving: boolean
  onSubmitPremise: (p: PremiseFormData) => void
}> = props => {
  const [likelihood, setLikelihood] = createSignal('50.0')
  const [text, setText] = createSignal('')

  const onSave = () => {
    // TODO: validate user inputs
    props.onSubmitPremise({
      likelihood: parseFloat(likelihood()) / 100,
      text: text()
    })
  }

  return (
    <>
      <div class="overflow-hidden border rounded bg-white">
        <div class="flex-1 px-2 py-1 border-b flex">
          <div class="flex-1">
            <span class="font-bold text-gray-700 pr-1">
              New premise
            </span>
          </div>
          <div>
            likelihood: 
            <input
              type="text"
              class="w-10 border rounded pl-0.5"
              value={likelihood()}
              onChange={etv(setLikelihood)}
            /> %
          </div>
        </div>
        <textarea
          rows={3}
          placeholder="Type a premise here..."
          class="text-lg px-2 py-1 focus:outline-none block w-full"
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