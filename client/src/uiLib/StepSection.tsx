import type { Component, JSX } from 'solid-js'
import { TextBlock } from './Text'

type StepSectionProps = {
  label: string
  children: JSX.Element
}

export const StepSection: Component<StepSectionProps> = (props) => (
  <section>
    <TextBlock size="lg" bold color="muted" class="uppercase tracking-wide mb-1">{props.label}</TextBlock>
    {props.children}
  </section>
)
