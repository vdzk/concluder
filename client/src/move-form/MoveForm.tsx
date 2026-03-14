import { Component, createSignal } from "solid-js"
import { Dynamic } from "solid-js/web"
import { GetMoveResponse } from "../../../shared/types"
import { DirectionStage, type Props as DirectionStageProps } from "./DirectionStage"
import { ArgumentFocusStage, ArgumentFocusArea, type Props as ArgumentFocusStageProps } from "./ArgumentFocusStage"
import { HiddenPremiseStage, type Props as HiddenPremiseStageProps } from "./HiddenPremiseStage"
import { LinkToConclusionStage, type Props as LinkToConclusionStageProps } from "./LinkToConclusionStage"
import { MoveEditArgumentStage, type Props as MoveEditArgumentStageProps } from "./MoveEditArgumentStage"
import { MoveExplicitPremiseStage, type Props as MoveExplicitPremiseStageProps } from "./MoveExplicitPremiseStage"
import { BadgeTarget, buildTargetProps, FormTargetEntry } from "../move/TargetEntry"
import { Card } from "../move/Card"

export type { BadgeTarget }

// Intersection of all stage prop types: Dynamic receives the full set,
// each stage reads only the props it declares.
type StageProps =
  DirectionStageProps &
  ArgumentFocusStageProps &
  MoveEditArgumentStageProps &
  MoveExplicitPremiseStageProps &
  LinkToConclusionStageProps &
  HiddenPremiseStageProps

export const MoveForm: Component<{
  data: GetMoveResponse
  badgeTarget: BadgeTarget
  onCancel: () => void
}> = props => {
  const [pro, setPro] = createSignal<boolean>()
  const [argumentFocusArea, setArgumentFocusArea] = createSignal<ArgumentFocusArea>()

  const { targetMove, targetText, targetStatementId } = buildTargetProps(props.badgeTarget, props.data)
  const targetEntry = <Card><FormTargetEntry badgeTarget={props.badgeTarget} data={props.data} /></Card>
  const mainClaimId = props.data.move.claim_id
  const conclusionText = props.data.targetArgumentClaim?.text ?? props.data.claimStatement.text
  const isAddArgument = targetMove.type === 'addArgument'

  const focusAreaStages: Record<ArgumentFocusArea, Component<StageProps>> = {
    explicitPremise: MoveExplicitPremiseStage as Component<StageProps>,
    linkToConclusion: LinkToConclusionStage as Component<StageProps>,
    hiddenPremise: HiddenPremiseStage as Component<StageProps>,
  }

  const getStage = (): Component<StageProps> => {
    if (pro() === undefined) {
      return DirectionStage as Component<StageProps>
    } else if (isAddArgument) {
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
        clearForm={props.onCancel}
        pro={pro()!}
        setPro={setPro}
        setArgumentFocusArea={(area?: ArgumentFocusArea) => setArgumentFocusArea(area)}
        targetEntry={targetEntry}
        targetMove={targetMove}
        mainClaimId={mainClaimId}
        targetText={targetText}
        targetStatementId={targetStatementId}
        conclusionText={conclusionText}
      />
    </main>
  )
}
