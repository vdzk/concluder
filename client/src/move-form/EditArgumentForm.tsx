import { Component, createSignal, JSXElement, Show } from "solid-js"
import { etv } from "../utils"
import { TextButton } from "../Buttons"
import { Card } from "../move/Card"

export const EditArgumentForm: Component<{
  pro: boolean
  targetEntry: JSXElement
  onSubmit: (text: string, pro: boolean, strength: number) => Promise<void>
  onBack: () => void
  onCancel: () => void
}> = props => {
  const [inputText, setInputText] = createSignal('')
  const [text, setText] = createSignal('')
  const [score, setScore] = createSignal('50.0')

  const onNext = () => {
    const trimmedText = inputText().trim()
    if (trimmedText) {
      setText(trimmedText)
    }
  }

  const onSubmit = async () => {
    const strength = parseFloat(score()) / 100
    if (strength >= 0 && strength <= 1) {
      await props.onSubmit(text(), props.pro, strength)
    }
  }

  return (
    <>
      {props.targetEntry}
      <Card>
        <div class="font-bold pb-1">
          What's your argument{' '}
          <span
            class="font-bold inline-block pr-1"
            classList={{
              'text-green-700 dark:text-green-400': props.pro,
              'text-red-700 dark:text-red-400': !props.pro
            }}
          >
            {props.pro ? 'supporting' : 'opposing'}
          </span>
          this?
        </div>
        <div class="pb-2 w-2xl max-w-full">
          <textarea
            rows={3}
            placeholder="Type here..."
            class="border rounded px-1.5 py-0.5 focus:outline-none block w-full"
            onChange={etv(setInputText)}
            value={inputText()}
          />
        </div>
        <Show when={text()}>
          <div class="font-bold pb-1">
            How strong is your argument?
          </div>
          <div class="pb-2">
            <input
              type="text"
              value={score()}
              onChange={etv(setScore)}
              class="w-11 border rounded pl-1.5 py-0."
            /> %
          </div>
        </Show>
      </Card>
      <Card>
        <div class="flex gap-2">
          <Show when={text()}>
            <TextButton
              label="Submit"
              color="green"
              onClick={onSubmit}
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
            onClick={props.onBack}
          />
          <TextButton
            label="Cancel"
            color="gray"
            onClick={props.onCancel}
          />
        </div>
      </Card>
    </>
  )
}
