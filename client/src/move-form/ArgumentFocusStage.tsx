import { Component, createSignal, For, JSXElement } from "solid-js";
import { TextButton } from "../Buttons";
import { etv } from "../utils";
import { Card } from "../move/Card";

const focusAreas = ['explicitPremise', 'linkToConclusion', 'hiddenPremise'] as const

export type ArgumentFocusArea = typeof focusAreas[number]

const focusAreaDescriptions: Record<ArgumentFocusArea, string> = {
  explicitPremise: 'Something that is stated in its premises.',
  linkToConclusion: 'That the conclusion follows from its premises.',
  hiddenPremise: 'A hidden assumption that the argument relies on.'
}

export type Props = {
  targetEntry: JSXElement
  clearForm: () => void
  pro: boolean
  setPro: (pro?: boolean) => void
  setArgumentFocusArea: (area?: ArgumentFocusArea) => void
}

export const ArgumentFocusStage: Component<Props> = props => {
  const [focusedArea, setFocusedArea] = createSignal<ArgumentFocusArea>(focusAreas[0])

  return (
    <>
      {props.targetEntry}
      <Card>
        <div class="font-bold">
          What about this argument are you{' '}
          <span
            class="font-bold"
            classList={{
              'text-green-700 dark:text-green-400': props.pro,
              'text-red-700 dark:text-red-400': !props.pro
            }}
          >
            {props.pro ? 'supporting' : 'opposing'}
          </span>
          ?
        </div>
        <For each={focusAreas}>
          {focusArea => (
            <div>
              <input
                class="cursor-pointer"
                type="radio"
                name="focusArea"
                id={focusArea}
                value={focusArea}
                checked={focusArea === focusedArea()}
                onChange={etv(setFocusedArea)}
              />
              <label
                for={focusArea}
                class="pl-1 cursor-pointer"
              >
                {focusAreaDescriptions[focusArea]}
              </label>
            </div>
          )}
        </For>
      </Card>
      <Card>
        <div class="flex gap-2">
          <TextButton
            label="Next"
            color="green"
            onClick={() => props.setArgumentFocusArea(focusedArea())}
          />
          <TextButton
            label="Back"
            color="gray"
            onClick={() => props.setPro()}
          />
          <TextButton
            label="Cancel"
            color="gray"
            onClick={props.clearForm}
          />
        </div>
      </Card>
    </>
  )

}