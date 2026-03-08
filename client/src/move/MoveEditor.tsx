import { Component, createSignal } from "solid-js"
import { etv, rpc } from "../utils"
import { IconButton } from "../Buttons"
import { MoveRecord } from "../../../shared/types"

export const MoveEditor: Component<{
  targetMove: MoveRecord
  pro?: boolean
  onSave: () => void
  onCancel: () => void
  mainClaimId: number
}> = props => {
  const [text, setText] = createSignal('')
  const [score, setScore] = createSignal('50.0')
  const onSave = async () => {
    const argument = {
      claim_id: props.targetMove.statement_id,
      text: text(),
      pro: props.pro,
      strength: parseFloat(score()) / 100
    }
    const move = {
      claim_id: props.mainClaimId,
      type: 'addArgument',
      target_id: props.targetMove.id
    }
    await rpc('addArgumentMove', { argument, move })
    props.onSave()
  }

  return (
    <>
      <div class="mt-3 border px-2 rounded bg-white dark:bg-gray-700">
        <div class="py-1 font-bold">
          What's your argument 
          <span
            class="font-bold inline-block pr-1"
            classList={{
              'text-green-700 dark:text-green-400': props.pro,
              'text-red-700 dark:text-red-400': !props.pro
            }}
          >
            {props.pro ? 'supporting' : 'opposing'}
          </span>
          the above?
        </div>
        <div class="overflow-hidden border rounded bg-white dark:bg-gray-800">
          <textarea
            rows={3}
            placeholder="Type here..."
            class="px-2 py-1 focus:outline-none block w-full dark:bg-gray-800"
            onChange={etv(setText)}
            value={text()}
          />
        </div>
        <div class="py-1 font-bold">How strong is this argument?</div>
        <input
          type="text"
          value={score()}
          onChange={etv(setScore)}
          class="w-10 border rounded pl-0.5 bg-white dark:bg-gray-700"
        /> %
        <div class="h-2" />
      </div>
      <div class="flex justify-end">
        <IconButton
          label="cancel"
          iconName="x"
          onClick={props.onCancel}
        />
        <IconButton
          label="save"
          iconName="save"
          onClick={onSave}
        />
      </div>
    </>
  )
}