import { Component, createSignal, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { MoveRecord } from "../../../shared/types"
import { etv, rpc } from "../utils"
import { TextButton } from "../Buttons"
import { Card } from "../move/Card"
import type { ArgumentFocusArea } from "./ArgumentFocusStage"

export type Props = {
  clearForm: () => void
  pro: boolean
  setArgumentFocusArea: (area?: ArgumentFocusArea) => void
  targetText: string
  mainClaimId: number
  targetMove: MoveRecord
}

export const HiddenPremiseStage: Component<Props> = props => {
  const navigate = useNavigate()
  const [inputText, setInputText] = createSignal('')
  const [text, setText] = createSignal('')
  const [likelihood, setLikelihood] = createSignal('50.0')

  const onNext = () => {
    const trimmed = inputText().trim()
    if (trimmed) setText(trimmed)
  }

  const onSubmit = async () => {
    const value = parseFloat(likelihood()) / 100
    if (value >= 0 && value <= 1) {
      const result = await rpc('addHiddenPremiseMove', {
        targetArgumentId: props.targetMove.argument_id,
        premiseText: text(),
        likelihood: value,
        move: { claim_id: props.mainClaimId }
      })
      navigate(`/move/${result.savedId}`)
    }
  }

  const onBack = () => {
    if (text()) setText('')
    else props.setArgumentFocusArea()
  }

  return (
    <>
      <Card><div class="text-lg">{props.targetText}</div></Card>
      <Card>
        <div class="font-bold pb-1">
          What hidden assumption does this argument rely on?
        </div>
        <div class="pb-2 w-2xl max-w-full">
          <textarea
            rows={3}
            placeholder="Type the hidden premise..."
            class="border rounded px-1.5 py-0.5 focus:outline-none block w-full"
            onChange={etv(setInputText)}
            value={inputText()}
          />
        </div>
        <Show when={text()}>
          <div class="font-bold pb-1">
            How likely is this premise to be true?
          </div>
          <div class="pb-2">
            <input
              type="text"
              value={likelihood()}
              onChange={etv(setLikelihood)}
              class="w-11 border rounded pl-1.5 py-0."
            /> %
          </div>
        </Show>
      </Card>
      <Card>
        <div class="flex gap-2">
          <Show when={text()}>
            <TextButton label="Submit" color="green" onClick={onSubmit} />
          </Show>
          <Show when={!text()}>
            <TextButton label="Next" color="green" onClick={onNext} />
          </Show>
          <TextButton label="Back" color="gray" onClick={onBack} />
          <TextButton label="Cancel" color="gray" onClick={props.clearForm} />
        </div>
      </Card>
    </>
  )
}