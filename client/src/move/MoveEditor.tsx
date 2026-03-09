import { Component, createSignal, Show } from "solid-js"
import { etv, rpc } from "../utils"
import { IconButton, TextButton } from "../Buttons"
import { MoveRecord } from "../../../shared/types"
import { Line } from "./Line"
import { CutGap } from "./CutGap"

const bulletHead = () => <div class="text-center">●</div>
const questionHead = () => <div class="font-bold text-center">Q</div>

export const MoveEditor: Component<{
  targetMove: MoveRecord
  onSave: () => void
  onCancel: () => void
  mainClaimId: number
}> = props => {
  const [text, setText] = createSignal('')
  const [score, setScore] = createSignal('50.0')
  const [pro, setPro] = createSignal<boolean>()
  const [touchedText, setTouchedText] = createSignal(false)
  const onSave = async () => {
    const argument = {
      claim_id: props.targetMove.statement_id,
      text: text(),
      pro: pro(),
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
      <Line class="h-1" />
      <Line head={questionHead()}>
        <div class="font-bold">
          What's your move?
        </div>
      </Line>
      <Line head={bulletHead()} onClick={() => setPro(false)} >
        Attack
      </Line>
      <Line head={bulletHead()} onClick={() => setPro(true)} >
        Defend
      </Line>
      <Show when={pro() !== undefined} >
        <Line head={questionHead()} class="font-bold pt-2">
          What's your argument{' '}
          <span
            class="font-bold inline-block pr-1"
            classList={{
              'text-green-700 dark:text-green-400': pro(),
              'text-red-700 dark:text-red-400': !pro()
            }}
          >
            {pro() ? 'supporting' : 'opposing'}
          </span>
          the above?
        </Line>
        <Line>
          <textarea
            rows={3}
            placeholder="Type here..."
            class="border px-2 py-1 focus:outline-none block w-full dark:bg-gray-800"
            onChange={etv(setText)}
            value={text()}
          />
        </Line>
        <Line head={questionHead()} class="pt-2 font-bold">How strong is this argument?</Line>
        <Line>
          <input
            type="text"
            value={score()}
            onChange={etv(setScore)}
            onInput={() => setTouchedText(true)}
            class="w-10 border rounded pl-0.5 bg-white dark:bg-gray-700"
          /> %
        </Line>
        <Line>
          <IconButton
            label="save"
            iconName="save"
            onClick={onSave}
            disabled={pro() === undefined || !touchedText()}
          />
        </Line>
      </Show>
      <Line class="h-2" />
      <Line
        class="border-y"
        onClick={props.onCancel}
        head={<img
          src="/arrow-left.svg"
          class="ml-0.5 mt-0.5 py-1 px-1 h-5"
        />}
      >
        Back
      </Line>
      <div class="h-4" />
      <Line class="h-2 border-t " />
    </>
  )
}