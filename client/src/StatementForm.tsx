import { Component, createSignal } from "solid-js"
import { IconButton } from "./Buttons"
import { etv } from "./utils"
import { PremiseFormData } from "../../shared/types"

export const StatementForm: Component<{
  saving: boolean
  onSubmitStatement: (p: PremiseFormData) => void
  initialData?: PremiseFormData
  hasArgument?: boolean
  isClaim?: boolean
}> = props => {
  const [likelihood, setLikelihood] = createSignal(
    props.initialData ? (props.initialData.likelihood * 100).toFixed(1) : '50.0'
  )
  const [text, setText] = createSignal(props.initialData?.text ?? '')

  const onSave = () => {
    // TODO: validate user inputs
    props.onSubmitStatement({
      likelihood: parseFloat(likelihood()) / 100,
      text: text()
    })
  }

  return (
    <>
      <div class="overflow-hidden border rounded bg-white dark:bg-gray-800">
        <div class="flex-1 px-2 py-1 border-b flex items-center">
          <div class="flex-1">
            <span class="font-bold text-gray-700 dark:text-gray-300 pr-1">
              {props.initialData ? `Edit ${props.isClaim ? 'claim' : 'premise'}` : 'New premise'}
            </span>
          </div>
          <div>
            confidence: 
            <input
              type="text"
              class="w-10 border rounded pl-0.5 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-700 dark:disabled:bg-gray-600 dark:disabled:text-gray-500"
              value={likelihood()}
              onChange={etv(setLikelihood)}
              disabled={props.hasArgument}
            /> %
          </div>
        </div>
        <textarea
          rows={3}
          placeholder="Which assumption does the argument immediately above rely on? Please write it out as an independent statement without referring to the argument itself."
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
    </>
  )
}