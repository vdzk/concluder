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
      <Line class="h-1" />
      <Show when={pro() === undefined}>
        <Line>
          <div class="flex gap-2">
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
          </div>
        </Line>
      </Show>
      <Show when={pro() !== undefined && !text()} >
        <Line head={questionHead()} class="font-bold">
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
            class="mt-0.5 border rounded px-1 focus:outline-none block w-full dark:bg-gray-800 mr-2"
            onChange={etv(setInputText)}
            value={inputText()}
          />
        </Line>
      </Show>
      <Show when={text()}>
        <Line
          head={
            <img
              class="px-1 py-1 h-6"
              src={`/${pro() ? 'shield' : 'sword'}.svg`}
              alt={pro() ? 'shield' : 'sword'}
            />
          }
        >
          {text()}
        </Line>
        <Line head={questionHead()} class="font-bold">
          How strong is your argument?
        </Line>
        <Line>
          <input
            type="text"
            value={score()}
            onChange={etv(setScore)}
            onInput={() => setTouchedText(true)}
            class="w-10 border rounded pl-0.5 bg-white dark:bg-gray-700"
          /> %
        </Line>
      </Show>
      <Line class="h-2" />
      <LineCustom
        class="border-y"
      >
        <div class="flex">
          <div
            class={`flex-1 flex ${clickableStyle}`}
            onClick={onBack}
          >
            <img
              src="/arrow-left.svg"
              class="ml-1 mr-0.5 my-0.5 py-1 px-1 h-5"
            />
            Back
          </div>
          <Show when={pro() !== undefined}>
            <div
              class={`flex-1 flex justify-end border-l ${clickableStyle}`}
              onClick={onNext}
            >
              Next
              <img
                src="/arrow-right.svg"
                class="mr-1 ml-0.5 my-0.5 py-1 px-1 h-5"
              />
            </div>
          </Show>
        </div>
      </LineCustom>
      <Show when={!props.isLastMove}>
        <div class="h-4" />
        <Line class="h-2 border-t " />
      </Show>
    </>
  )
}