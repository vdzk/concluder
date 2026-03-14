import { Component, JSXElement } from "solid-js";
import { TextButton } from "../Buttons";
import { Card } from "../move/Card";

export type Props = {
  targetEntry: JSXElement
  setPro: (pro?: boolean) => void
  clearForm: () => void
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
