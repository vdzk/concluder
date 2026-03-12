import { Component, JSXElement } from "solid-js";
import { TextButton } from "../Buttons";
import { MoveRecord } from "../../../shared/types";

export const DirectionStage: Component<{
  targetEntry: JSXElement
  setPro: (pro: boolean) => void
  clearForm: () => void
  targetMove: MoveRecord
}> = props => {
  return (
    <>
      {props.targetEntry}
      <div class="px-2 pb-2 flex gap-2">
        <TextButton
          label="Attack"
          color="red"
          onClick={() => props.setPro(false)} />
        <TextButton
          label="Defend"
          color="green"
          onClick={() => props.setPro(true)} />
        <TextButton
          label="Cancel"
          color="gray"
          onClick={props.clearForm} />
      </div>
    </>
  );
};
