import { Component, Show } from "solid-js"
import { GetMoveResponse } from "../../../shared/types"
import { getPercent } from "../utils"
import { Card, KebabButton, MenuCard, RespondButton, OriginMoveLink, ResponseMoveLinks } from "./Card"
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
  targetOriginMoveId: number | null
  responseMoveIds: Record<string, number[]>
  openMenu: string | null
  onToggleMenu: (key: string) => void
  onRespond: (targetType: 'argument' | 'statement', targetId: number) => void
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
        <Card class="text-lg">
          <div>{props.targetArgumentClaim?.text}</div>
          <div class="font-bold">
            <span classList={{ 'text-green-700': props.targetArgument!.pro, 'text-red-700': !props.targetArgument!.pro }}>
              {props.targetArgument!.pro ? 'is true because...' : 'is false because...'}
            </span>
          </div>
          <div>{props.targetArgument!.text}</div>
          <div class="flex items-center justify-between text-base mt-1">
            <span title="argument strength">💪 {getPercent(props.targetArgument!.strength)}</span>
            <KebabButton onClick={() => props.onToggleMenu('targetArg')} />
          </div>
        </Card>
        <MenuCard open={props.openMenu === 'targetArg'}>
          <RespondButton onClick={() => props.onRespond('argument', props.targetArgument!.id)} />
          <OriginMoveLink moveId={props.targetOriginMoveId} />
          <ResponseMoveLinks moveIds={props.responseMoveIds[`a:${props.targetArgument!.id}`]} />
        </MenuCard>
      </Show>
      <Show when={showStmtTarget()}>
        <Card>
          <AvatarRow svg={props.avatar.svg} name={props.avatar.display_name} label="picks a statement:" />
        </Card>
        <Card class="text-lg">
          <div>{props.targetStatement!.text}</div>
          <div class="flex items-center justify-between text-base mt-1">
            <span title="certainty">🎲 {getPercent(props.targetStatement!.likelihood)}</span>
            <KebabButton onClick={() => props.onToggleMenu('targetStmt')} />
          </div>
        </Card>
        <MenuCard open={props.openMenu === 'targetStmt'}>
          <RespondButton onClick={() => props.onRespond('statement', props.targetStatement!.id)} />
          <OriginMoveLink moveId={props.targetOriginMoveId} />
          <ResponseMoveLinks moveIds={props.responseMoveIds[`s:${props.targetStatement!.id}`]} />
        </MenuCard>
      </Show>
    </>
  )
}
