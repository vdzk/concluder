import { Component, createResource, createSignal, Show, Suspense } from "solid-js"
import { Dynamic } from "solid-js/web"
import { useNavigate, useParams } from "@solidjs/router"
import { MoveFormTarget } from "../../../shared/types"
import { rpc } from "../utils"
import { DirectionStage, type Props as DirectionStageProps } from "./DirectionStage"
import { Loading } from "../Loading"
import { ArgumentFocusStage, ArgumentFocusArea, type Props as ArgumentFocusStageProps } from "./ArgumentFocusStage"
import { HiddenPremiseStage, type Props as HiddenPremiseStageProps } from "./HiddenPremiseStage"
import { LinkToConclusionStage, type Props as LinkToConclusionStageProps } from "./LinkToConclusionStage"
import { MoveEditArgumentStage, type Props as MoveEditArgumentStageProps } from "./MoveEditArgumentStage"
import { MoveExplicitPremiseStage, type Props as MoveExplicitPremiseStageProps } from "./MoveExplicitPremiseStage"
import { Card } from "../move/Card"

// Intersection of all stage prop types: Dynamic receives the full set,
// each stage reads only the props it declares.
type StageProps =
  DirectionStageProps &
  ArgumentFocusStageProps &
  MoveEditArgumentStageProps &
  MoveExplicitPremiseStageProps &
  LinkToConclusionStageProps &
  HiddenPremiseStageProps

const MoveFormInner: Component<{ target: MoveFormTarget; claimId: number; moveId: string }> = (props) => {
  const navigate = useNavigate()
  const [pro, setPro] = createSignal<boolean>()
  const [argumentFocusArea, setArgumentFocusArea] = createSignal<ArgumentFocusArea>()

  const { target } = props
  const isTargetingArgument = target.type === 'argument'

  const targetEntry = (
    <Card>
      {target.type === 'argument' ? (
        <div class="text-lg">
          <div>{target.conclusionText}</div>
          <div class="font-bold">
            <span classList={{ 'text-green-700': target.pro, 'text-red-700': !target.pro }}>
              {target.pro ? 'is true because...' : 'is false because...'}
            </span>
          </div>
          <div>{target.text}</div>
        </div>
      ) : (
        <div class="text-lg">{target.text}</div>
      )}
    </Card>
  )

  const clearForm = () => navigate(`/move/${props.moveId}`)

  const focusAreaStages: Record<ArgumentFocusArea, Component<StageProps>> = {
    explicitPremise: MoveExplicitPremiseStage as Component<StageProps>,
    linkToConclusion: LinkToConclusionStage as Component<StageProps>,
    hiddenPremise: HiddenPremiseStage as Component<StageProps>,
  }

  const getStage = (): Component<StageProps> => {
    if (pro() === undefined) {
      return DirectionStage as Component<StageProps>
    } else if (isTargetingArgument) {
      const focusArea = argumentFocusArea()
      if (focusArea === undefined) {
        return ArgumentFocusStage as Component<StageProps>
      } else {
        return focusAreaStages[focusArea]
      }
    } else {
      return MoveEditArgumentStage as Component<StageProps>
    }
  }

  return (
    <main class="w-2xl max-w-full mx-auto mt-4 flex flex-col gap-4">
      <Dynamic
        component={getStage()}
        clearForm={clearForm}
        pro={pro()!}
        setPro={setPro}
        setArgumentFocusArea={(area?: ArgumentFocusArea) => setArgumentFocusArea(area)}
        targetEntry={targetEntry}
        argumentId={target.type === 'argument' ? target.id : 0}
        mainClaimId={props.claimId}
        targetText={target.text}
        targetStatementId={target.type === 'statement' ? target.id : null}
        conclusionText={target.type === 'argument' ? target.conclusionText : ''}
      />
    </main>
  )
}

export const MoveForm: Component = () => {
  const params = useParams<{ targetType: string; targetId: string; claimId: string; moveId: string }>()
  const [data] = createResource(
    () => ({ targetType: params.targetType, targetId: params.targetId }),
    (p) => rpc('getMoveFormTarget', {
      targetType: p.targetType,
      targetId: parseInt(p.targetId),
    }) as Promise<MoveFormTarget>
  )

  return (
    <Suspense fallback={<Loading />}>
      <Show when={data()} keyed>
        {(target) => (
          <MoveFormInner
            target={target}
            claimId={parseInt(params.claimId)}
            moveId={params.moveId}
          />
        )}
      </Show>
    </Suspense>
  )
}
