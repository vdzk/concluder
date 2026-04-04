import { createResource, Show, type Component } from 'solid-js'
import { trpc } from '../trpc'
import { StepContent } from './StepContent'
import { TextBlock } from './ui/Text'

type Props = {
  id: number
}

export const StepView: Component<Props> = (props) => {
  const [step] = createResource(
    () => props.id,
    (id) => trpc.reasoningStep.getById.query({ id })
  );

  return (
    <Show when={step()} fallback={<TextBlock color="muted">{step.loading ? 'Loading…' : 'Not found.'}</TextBlock>}>
      {s => (
        <StepContent
          question={s().question}
          analysis={s().analysis}
          annotatedAnalysis={s().annotatedAnalysis}
          conclusion={s().conclusion}
        />
      )}
    </Show>
  );
}
