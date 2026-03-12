import { Component, createSignal, Show } from "solid-js"
import { etv, rpc } from "../utils"
import { TextButton } from "../Buttons"
import { MoveRecord } from "../../../shared/types"
import { clickableStyle, Line, LineCustom } from "./Line"

const questionHead = () => <div class="font-bold text-center">Q</div>

export const MoveEditor: Component<{
  targetMove: MoveRecord
  onSave: () => void
  onCancel: () => void
  mainClaimId: number
  isLastMove: boolean
}> = props => {
  const [inputText, setInputText] = createSignal('')
  const [text, setText] = createSignal('')
  const [score, setScore] = createSignal('50.0')
  const [pro, setPro] = createSignal<boolean>()
  const [touchedText, setTouchedText] = createSignal(false)

  const onBack = () => {
    if (text()) {
      setText('')
    } else if (pro() !== undefined) {
      setPro()
    } else {
      props.onCancel()
    }
  }

  const onNext = () => {
    if (text()) {
      const strength = parseFloat(score()) / 100
      if (strength >= 0 && strength <= 1) {
        save(text(), pro()!, strength)
      }
    } else {
      const trimmedText = inputText().trim()
      if (trimmedText) {
        setText(trimmedText)
      }
    }
  }

  const save = async (text: string, pro: boolean, strength: number) => {
    const argument = {
      claim_id: props.targetMove.statement_id,
      text, pro, strength
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
      <div class="h-2" />
      <div class="ml-7 bg-[#efe3c6] rounded-l-lg pl-3 py-3 relative">
        <div class="bg-[#efe3c6] absolute h-2 w-2 right-0 -top-2">
          <div class="h-full bg-white dark:bg-gray-900 rounded-br-full" />
        </div>
        <div class="bg-[#efe3c6] absolute h-2 w-2 right-0 -bottom-2">
          <div class="h-full bg-white dark:bg-gray-900 rounded-tr-full" />
        </div>
        <Show when={pro() === undefined}>
          <div class="flex gap-3">
            <TextButton
              label="Attack"
              color="red"
              onClick={() => setPro(false)}
            />
            <TextButton
              label="Defend"
              color="green"
              onClick={() => setPro(true)}
            />
            <TextButton
              label="Cancel"
              color="gray"
              onClick={props.onCancel}
            />
          </div>
        </Show>
        <Show when={pro() !== undefined} >
          <div class="font-bold relative -top-1">
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
          </div>
          <div>
            <textarea
              rows={3}
              placeholder="Type here..."
              class="mt-0.5 rounded px-1.5 py-0.5 focus:outline-none block w-full bg-yellow-50 dark:bg-gray-800"
              onChange={etv(setInputText)}
              value={inputText()}
            />
          </div>
          <Show when={text()}>
            <div class="font-bold pt-2">
              How strong is your argument?
            </div>
            <div>
              <input
                type="text"
                value={score()}
                onChange={etv(setScore)}
                onInput={() => setTouchedText(true)}
                class="w-11 border rounded pl-1.5 py-0.5 bg-yellow-50 dark:bg-gray-700"
              /> %
            </div>
          </Show>
          <div class="flex gap-3 pt-3">
            <Show when={text()}>
              <TextButton
                label="Submit"
                color="green"
                onClick={onNext}
              />
            </Show>
            <Show when={!text()}>
              <TextButton
                label="Next"
                color="green"
                onClick={onNext}
              />
            </Show>
            <TextButton
              label="Back"
              color="gray"
              onClick={onBack}
            />
            <TextButton
              label="Cancel"
              color="gray"
              onClick={props.onCancel}
            />
          </div>
        </Show>
      </div>
      <div class="h-6" />
    </>
  )
}