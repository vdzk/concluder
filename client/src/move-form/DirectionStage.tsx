import { Component, JSXElement } from "solid-js";
import { TextButton } from "../Buttons";
import { MoveRecord } from "../../../shared/types";
import { Card } from "../move/Card";

export type Props = {
  targetEntry: JSXElement
  setPro: (pro?: boolean) => void
  clearForm: () => void
  targetMove: MoveRecord
}

export const DirectionStage: Component<Props> = props => {
  return (
    <>
      {props.targetEntry}
      <Card>
        <div class="flex gap-2">
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
      </Card>
    </>
  );
};
