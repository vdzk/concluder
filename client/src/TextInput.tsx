import { Component, Show } from "solid-js";
import { etv } from "./utils";
import { Button } from "./Buttons";

export const TextInput: Component<{
  value: string
  onChange: (val: string) => void
  placeholder?: string
  saving?: boolean
  onSubmit: () => void
  onCancel?: () => void
}> = props => {
  return (
    <div class="px-2 py-2 gap-2">
      <textarea
        autofocus
        class="bg-white px-1 border rounded block w-full"
        value={props.value}
        onChange={etv(props.onChange)}
        placeholder={props.placeholder}
      />
      <div class="flex justify-end pt-2 gap-2">
        <Show when={props.saving}>
          Saving...
        </Show>
        <Show when={!props.saving}>
          <Button
            label="Submit"
            onClick={props.onSubmit}
          />
        </Show>
        <Show when={!props.saving && props.onCancel}>
          <Button
            label="Cancel"
            onClick={props.onCancel!}
          />
        </Show>
      </div>
    </div>
  )
}