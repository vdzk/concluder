import { Component, createSignal, Show } from "solid-js"
import { Button } from "./Button"
import { Step } from "./Argue"
import { getPercent } from "./utils"
import { Delta } from "./Delta"

export interface Premise {
  id: number
  argument_id: number
  statement_id: number
  invert: boolean
}

export interface ArgumentDataRow {
  id: number,
  claim_id: number,
  text: string,
  pro: boolean,
  strength: number,
  premises?: Premise[]
}

export const Argument: Component<{
  step: Step
  argument: ArgumentDataRow
  onShowPremises: (step: Step) => void
  onShiftPremise: (step: Step, premiseIndexDelta: number) => void
  scoreChange?: {old: number, new: number}
}> = props => {
  const [menuOpen, setMenuOpen] = createSignal(false)

  const onPremisesShow = () => {
    setMenuOpen(false)
    props.onShowPremises(props.step)
  }

  return (
    <div
      class="
        mt-4 overflow-hidden
        border rounded bg-white 
      "
    >
      <div class="flex">
        <div class="flex-1 px-2 py-1 text-lg relative">
          <span
            class="font-bold inline-block pr-1"
            classList={{
              'text-green-700': props.argument.pro,
              'text-red-700': !props.argument.pro
            }}
          >
            {props.argument.pro ? 'Pro:' : 'Con:'}
          </span>
          {props.argument.text}
          <div
            class="absolute right-2 bottom-1 font-bold text-gray-700"
            title="strength of the argument"
          >
            <Show when={props.scoreChange}>
              {getPercent(props.scoreChange!.new)}
              <Delta {...props.scoreChange!} />
            </Show>
            <Show when={!props.scoreChange}>
              {getPercent(props.argument.strength)}
            </Show>
          </div>
        </div>
        <div
          class="
            shrink-0 border-l text-xl py-1 px-1
            cursor-pointer select-none
            hover:bg-orange-100
          "
          onClick={() => setMenuOpen(prev => !prev)}
        >
          {menuOpen() ? '▲' : '▼'}
        </div>
      </div>
      <Show when={menuOpen()}>
        <div class="border-t px-2 py-2 flex gap-2">
          Premises:
          <Button
            label="Show"
            onClick={onPremisesShow}
          />
          <Button
            label="<-"
            onClick={() => props.onShiftPremise(props.step, -1)}
          />
          <Button
            label="->"
            onClick={() => props.onShiftPremise(props.step, 1)}
          />
        </div>
      </Show>
    </div>
  )
}