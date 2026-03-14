import { Component, createSignal, For, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { etv, rpc } from "../utils"
import { TextButton } from "../Buttons"
import { EditArgumentForm } from "./EditArgumentForm"
import { Card } from "../move/Card"
import type { ArgumentFocusArea } from "./ArgumentFocusStage"

export type Props = {
  clearForm: () => void
  pro: boolean
  setArgumentFocusArea: (area?: ArgumentFocusArea) => void
  targetText: string
  mainClaimId: number
  argumentId: number
}

export const MoveExplicitPremiseStage: Component<Props> = props => {
  const navigate = useNavigate()
  const [multiPremise, setMultiPremise] = createSignal(false)
  const [scopeSelected, setScopeSelected] = createSignal(false)
  const [premiseTextInput, setPremiseTextInput] = createSignal(props.targetText)
  const [premiseText, setPremiseText] = createSignal('')

  const onSubmit = async (text: string, pro: boolean, strength: number) => {
    const result = await rpc('addPremiseArgumentMove', {
      targetArgumentId: props.argumentId,
      argument: { text, pro, strength },
      move: { claim_id: props.mainClaimId }
    })
    navigate(`/move/${result.savedId}`)
  }

  const onSubmitMulti = async (text: string, pro: boolean, strength: number) => {
    const result = await rpc('addPremiseArgumentMove', {
      targetArgumentId: props.argumentId,
      premiseText: premiseText(),
      argument: { text, pro, strength },
      move: { claim_id: props.mainClaimId }
    })
    navigate(`/move/${result.savedId}`)
  }

  const onNext = () => {
    if (!scopeSelected()) setScopeSelected(true)
    else if (multiPremise() && !premiseText()) setPremiseText(premiseTextInput().trim())
  }

  const onBack = () => {
    if (premiseText()) setPremiseText('')
    else if (scopeSelected()) setScopeSelected(false)
    else props.setArgumentFocusArea()
  }

  const premiseTargetEntry = () => (
    <Card><div class="text-lg">{props.targetText}</div></Card>
  )

  const bottomButtons = (
    <Card>
      <div class="flex gap-2">
        <TextButton label="Next" color="green" onClick={onNext} />
        <TextButton label="Back" color="gray" onClick={onBack} />
        <TextButton label="Cancel" color="gray" onClick={props.clearForm} />
      </div>
    </Card>
  )

  return (
    <>
      <Show when={scopeSelected() && multiPremise() && premiseText()}>
        <EditArgumentForm
          pro={props.pro}
          targetEntry={<Card><div class="text-lg">{premiseText()}</div></Card>}
          onSubmit={onSubmitMulti}
          onBack={() => setPremiseText('')}
          onCancel={props.clearForm}
        />
      </Show>
      <Show when={scopeSelected() && multiPremise() && !premiseText()}>
        {premiseTargetEntry()}
        <Card>
          <div class="font-bold">
            Please keep the part that you would like to{' '}
            <span class="font-bold" classList={{
              'text-green-700 dark:text-green-400': props.pro,
              'text-red-700 dark:text-red-400': !props.pro
            }}>
              {props.pro ? 'support' : 'oppose'}
            </span>
            {' '}and remove the rest.
          </div>
          <div class="pb-2 w-2xl max-w-full">
            <textarea
              rows={3}
              placeholder="Type here..."
              class="border rounded px-1.5 py-0.5 focus:outline-none block w-full"
              onChange={etv(setPremiseTextInput)}
              value={premiseTextInput()}
            />
          </div>
        </Card>
        {bottomButtons}
      </Show>
      <Show when={scopeSelected() && !multiPremise()}>
        <EditArgumentForm
          pro={props.pro}
          targetEntry={premiseTargetEntry()}
          onSubmit={onSubmit}
          onBack={() => setScopeSelected(false)}
          onCancel={props.clearForm}
        />
      </Show>
      <Show when={!scopeSelected()}>
        {premiseTargetEntry()}
        <Card>
          <div class="font-bold">
            Which part of this would you like to{' '}
            <span class="font-bold" classList={{
              'text-green-700 dark:text-green-400': props.pro,
              'text-red-700 dark:text-red-400': !props.pro
            }}>
              {props.pro ? 'support' : 'oppose'}
            </span>
            ?
          </div>
          <For each={[true, false]}>
            {all => (
              <div>
                <input class="cursor-pointer" type="radio" name="focusArea"
                  id={all ? 'all' : 'some'} value={all ? 'all' : 'some'}
                  checked={all === !multiPremise()}
                  onChange={etv(val => setMultiPremise(val === 'some'))} />
                <label for={all ? 'all' : 'some'} class="pl-1 cursor-pointer">
                  {all ? 'All of it' : 'Some of it'}
                </label>
              </div>
            )}
          </For>
        </Card>
        {bottomButtons}
      </Show>
    </>
  )
}
