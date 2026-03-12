import { Component, createSignal, For, Show } from "solid-js"
import { TextButton } from "../Buttons"
import { etv, rpc } from "../utils"
import { EditArgumentForm } from "./EditArgumentForm"
import { MoveRecord } from "../../../shared/types"

export const ExplicitPremiseStage: Component<{
  clearForm: () => void
  pro: boolean
  setArgumentFocusArea: () => void
  targetText: string
  mainClaimId: number
  reloadTable: () => Promise<void>
  targetMove: MoveRecord
}> = props => {
  const [multiPremise, setMultiPremise] = createSignal(false)
  const [scopeSelected, setScopeSelected] = createSignal(false)
  const [premiseTextInput, setPremiseTextInput] = createSignal(props.targetText)
  const [premiseText, setPremiseText] = createSignal('')


  const onSinglePremiseSubmit = async (
    text: string, pro: boolean, strength: number
  ) => {
    const argument = {
      text, pro, strength
    }
    const move = {
      claim_id: props.mainClaimId,
      target_id: props.targetMove.id
    }
    const targetArgumentId = props.targetMove.argument_id
    await rpc('addPremiseArgumentMove', { targetArgumentId, argument, move })
    props.clearForm()
    await props.reloadTable()
  }

  const onNext = () => {
    if (scopeSelected()) {
      if (premiseTextInput() === props.targetText) return
      const trimmedInput = premiseTextInput()
      if (!trimmedInput) return
      setPremiseText(trimmedInput)
    } else {
      setScopeSelected(true)
    }
  }

  const onBack = () => {
    if (scopeSelected()) {
      setScopeSelected(false)
    } else {
      props.setArgumentFocusArea()
    }
  }

  const targetEntry = () => (
    <div class="px-2 py-1 text-lg">
      {props.targetText}
    </div>
  )

  const bottomButtons = (
    <div class="flex gap-2 px-2 pb-2 pt-1">
      <TextButton
        label="Next"
        color="green"
        onClick={onNext}
      />
      <TextButton
        label="Back"
        color="gray"
        onClick={onBack}
      />
      <TextButton
        label="Cancel"
        color="gray"
        onClick={props.clearForm}
      />
    </div>
  )

  return (
    <>
      <Show when={scopeSelected() && multiPremise()}>
        {targetEntry()}
        <div class="font-bold px-2">
          Please keep the part that you would like to{' '}
          <span
            class="font-bold"
            classList={{
              'text-green-700 dark:text-green-400': props.pro,
              'text-red-700 dark:text-red-400': !props.pro
            }}
          >
            {props.pro ? 'support' : 'oppose'}
          </span>
          and remove the rest.
        </div>
        <div class="px-2 pb-2 max-w-2xl">
          <textarea
            rows={3}
            placeholder="Type here..."
            class="border rounded px-1.5 py-0.5 focus:outline-none block w-full"
            onChange={etv(setPremiseTextInput)}
            value={premiseTextInput()}
          />
        </div>
        {bottomButtons}
      </Show>
      <Show when={scopeSelected() && !multiPremise()}>
        <EditArgumentForm
          pro={props.pro}
          targetEntry={targetEntry()}
          onSubmit={onSinglePremiseSubmit}
          onBack={() => setScopeSelected(false)}
          onCancel={props.clearForm}
        />
      </Show>
      <Show when={!scopeSelected()}>
        {targetEntry()}
        <div class="font-bold px-2">
          Which part of this would you like to{' '}
          <span
            class="font-bold"
            classList={{
              'text-green-700 dark:text-green-400': props.pro,
              'text-red-700 dark:text-red-400': !props.pro
            }}
          >
            {props.pro ? 'support' : 'oppose'}
          </span>
          ?
        </div>
        <For each={[true, false]}>
          {all => (
            <div class="px-2">
              <input
                class="cursor-pointer"
                type="radio"
                name="focusArea"
                id={all ? 'all' : 'some'}
                value={all ? 'all' : 'some'}
                checked={all === !multiPremise()}
                onChange={etv(val => setMultiPremise(val === 'some'))}
              />
              <label
                for={all ? 'all' : 'some'}
                class="pl-1 cursor-pointer"
              >
                {all ? 'All of it' : 'Some of it'}
              </label>
            </div>
          )}
        </For>
        {bottomButtons}
      </Show>
    </>
  )
}