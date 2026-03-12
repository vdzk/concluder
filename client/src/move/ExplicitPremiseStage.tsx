import { Component } from "solid-js"
import { TextButton } from "../Buttons"

export const ExplicitPremiseStage: Component<{
  clearForm: () => void
  pro: boolean
  setArgumentFocusArea: () => void
}> = props => {
  return (
    <>
      ExplicitPremiseStage
      <div class="flex gap-2 px-2 pb-2 pt-1">
        <TextButton
          label="Next"
          color="green"
          onClick={() => { }}
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
    </>
  )
}