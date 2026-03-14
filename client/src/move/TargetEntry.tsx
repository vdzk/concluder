import { Component, Show } from "solid-js"
import { GetMoveResponse } from "../../../shared/types"
import { getPercent } from "../utils"
import { Card } from "./Card"
import { AvatarRow } from "./AvatarRow"

// ---------------------------------------------------------------------------
// TargetEntry – read-only target display in the Move view
// ---------------------------------------------------------------------------

type Props = {
  move: GetMoveResponse['move']
  avatar: GetMoveResponse['avatar']
  targetArgument: GetMoveResponse['targetArgument']
  targetArgumentClaim: GetMoveResponse['targetArgumentClaim']
  targetStatement: GetMoveResponse['targetStatement']
  onBadgeClick: (targetType: 'argument' | 'statement', targetId: number) => void
}

export const TargetEntry: Component<Props> = (props) => {
  const showArgTarget = () =>
    props.targetArgument !== null &&
    props.move.type !== 'addPremiseArgument' &&
    props.move.type !== 'addArgument'

  const showStmtTarget = () =>
    !showArgTarget() &&
    props.targetStatement !== null &&
    props.targetStatement.id !== props.move.claim_id

  return (
    <>
      <Show when={showArgTarget()}>
        <Card>
          <AvatarRow svg={props.avatar.svg} name={props.avatar.display_name} label="picks an argument:" />
        </Card>
        <Card badge onBadgeClick={() => props.onBadgeClick('argument', props.targetArgument!.id)} class="text-lg">
          <div>{props.targetArgumentClaim?.text}</div>
          <div class="font-bold">
            <span classList={{ 'text-green-700': props.targetArgument!.pro, 'text-red-700': !props.targetArgument!.pro }}>
              {props.targetArgument!.pro ? 'is true because...' : 'is false because...'}
            </span>
          </div>
          <div>{props.targetArgument!.text}</div>
          <div class="text-base mt-1" title="argument strength">💪 {getPercent(props.targetArgument!.strength)}</div>
        </Card>
      </Show>
      <Show when={showStmtTarget()}>
        <Card>
          <AvatarRow svg={props.avatar.svg} name={props.avatar.display_name} label="picks a statement:" />
        </Card>
        <Card badge onBadgeClick={() => props.onBadgeClick('statement', props.targetStatement!.id)} class="text-lg">
          <div>{props.targetStatement!.text}</div>
          <div title="certainty" class="text-base mt-1">🎲 {getPercent(props.targetStatement!.likelihood)}</div>
        </Card>
      </Show>
    </>
  )
}
