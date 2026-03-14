import { Component } from "solid-js"
import { TextButton } from "../Buttons"
import { Card } from "../move/Card"
import type { ArgumentFocusArea } from "./ArgumentFocusStage"

export type Props = {
  clearForm: () => void
  pro: boolean
  setArgumentFocusArea: (area?: ArgumentFocusArea) => void
}

export const HiddenPremiseStage: Component<Props> = props => {
  return (
    <>
      <Card>
        HiddenPremiseStage
      </Card>
      <Card>
        <div class="flex gap-2">
          <TextButton
            label="Next"
            color="green"
            onClick={() => {}}
          />
          <TextButton
            label="Back"
            color="gray"
            onClick={() => props.setArgumentFocusArea()}
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