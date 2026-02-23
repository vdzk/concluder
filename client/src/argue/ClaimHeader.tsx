import { A } from "@solidjs/router"
import { Accessor, Show, type Component } from "solid-js"
import { tabs } from "../Home"
import { countries } from '../../../shared/constants'

export const ClaimHeader: Component<{ tag: Accessor<string>, countryCode: Accessor<string> }> = (props) => {
  return (
    <div class="flex justify-center">
      <A
        href={`/tab/${props.tag()}${props.countryCode() ? '/' + props.countryCode() : ''}`}
        class="font-bold hover:bg-orange-200 px-2 py-1"
      >
        {tabs[props.tag()]?.label}
        <Show when={props.countryCode()}>
          {' - '}
          {countries[props.countryCode()]}
        </Show>
      </A>
    </div>
  )
}
