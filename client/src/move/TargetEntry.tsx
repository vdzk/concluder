import { Component, Show } from "solid-js"
import { GetMoveResponse, MoveRecord } from "../../../shared/types"
import { getPercent } from "../utils"
import { Card } from "./Card"
import { AvatarRow } from "./AvatarRow"

export type BadgeTarget = 'claim' | 'argument' | 'targetStatement' | 'targetArgument' | 'premise'

// ---------------------------------------------------------------------------
// Helpers used by MoveForm to derive targetMove / targetText from the badge
// ---------------------------------------------------------------------------

export function buildTargetProps(
  badgeTarget: BadgeTarget,
  data: GetMoveResponse
): { targetMove: MoveRecord; targetText: string; targetStatementId: number | null } {
  const { move, claimStatement, statement, argument } = data

  if (badgeTarget === 'argument' && argument) {
    return {
      targetText: argument.text,
      targetStatementId: statement?.id ?? null,
      targetMove: {
        id: move.id,
        claim_id: move.claim_id,
        type: 'addArgument',
        argument_id: move.argument_id,
        premise_id: null,
        avatar_id: 0,
      },
    }
  }
  if (badgeTarget === 'targetStatement' && data.targetStatement) {
    const ts = data.targetStatement
    return {
      targetText: ts.text,
      targetStatementId: ts.id,
      targetMove: {
        id: move.id,
        claim_id: move.claim_id,
        type: 'addPremiseArgument',
        argument_id: move.argument_id,
        premise_id: null,
        avatar_id: 0,
      },
    }
  }
  if (badgeTarget === 'targetArgument' && data.targetArgument) {
    const ta = data.targetArgument
    return {
      targetText: ta.text,
      targetStatementId: data.targetArgumentClaim?.id ?? null,
      targetMove: {
        id: move.id,
        claim_id: move.claim_id,
        type: 'addArgument',
        argument_id: ta.id,
        premise_id: null,
        avatar_id: 0,
      },
    }
  }
  if (badgeTarget === 'premise' && data.premiseStatement) {
    const ps = data.premiseStatement
    return {
      targetText: ps.text,
      targetStatementId: ps.id,
      targetMove: {
        id: move.id,
        claim_id: move.claim_id,
        type: 'addPremiseArgument',
        argument_id: move.argument_id,
        premise_id: move.premise_id,
        avatar_id: 0,
      },
    }
  }
  return {
    targetText: claimStatement.text,
    targetStatementId: claimStatement.id,
    targetMove: {
      id: move.id,
      claim_id: move.claim_id,
      type: 'addClaim',
      argument_id: null,
      premise_id: null,
      avatar_id: 0,
    },
  }
}

// ---------------------------------------------------------------------------
// FormTargetEntry – shows the target context inside MoveForm stages
// ---------------------------------------------------------------------------

export const FormTargetEntry: Component<{ badgeTarget: BadgeTarget; data: GetMoveResponse }> = (props) => {
  const { claimStatement, argument, targetArgumentClaim } = props.data

  if (props.badgeTarget === 'argument' && argument) {
    const claimText = targetArgumentClaim?.text ?? claimStatement.text
    return (
      <div class="text-lg">
        <div>{claimText}</div>
        <div class="font-bold">
          <span classList={{ 'text-green-700': argument.pro, 'text-red-700': !argument.pro }}>
            {argument.pro ? 'is true because...' : 'is false because...'}
          </span>
        </div>
        <div>{argument.text}</div>
      </div>
    )
  }
  if (props.badgeTarget === 'targetArgument' && props.data.targetArgument) {
    const ta = props.data.targetArgument
    const claimText = props.data.targetArgumentClaim?.text ?? claimStatement.text
    return (
      <div class="text-lg">
        <div>{claimText}</div>
        <div class="font-bold">
          <span classList={{ 'text-green-700': ta.pro, 'text-red-700': !ta.pro }}>
            {ta.pro ? 'is true because...' : 'is false because...'}
          </span>
        </div>
        <div>{ta.text}</div>
      </div>
    )
  }
  if (props.badgeTarget === 'targetStatement' && props.data.targetStatement) {
    return <div class="text-lg">{props.data.targetStatement.text}</div>
  }
  if (props.badgeTarget === 'premise' && props.data.premiseStatement) {
    return <div class="text-lg">{props.data.premiseStatement.text}</div>
  }
  return <div class="text-lg">{claimStatement.text}</div>
}

// ---------------------------------------------------------------------------
// TargetEntry – read-only target display in the Move view
// ---------------------------------------------------------------------------

type Props = {
  move: GetMoveResponse['move']
  avatar: GetMoveResponse['avatar']
  targetArgument: GetMoveResponse['targetArgument']
  targetArgumentClaim: GetMoveResponse['targetArgumentClaim']
  targetStatement: GetMoveResponse['targetStatement']
  onBadgeClick: (target: BadgeTarget) => void
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
        <Card badge onBadgeClick={() => props.onBadgeClick('targetArgument')} class="text-lg">
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
        <Card badge onBadgeClick={() => props.onBadgeClick('targetStatement')} class="text-lg">
          <div>{props.targetStatement!.text}</div>
          <div title="certainty" class="text-base mt-1">🎲 {getPercent(props.targetStatement!.likelihood)}</div>
        </Card>
      </Show>
    </>
  )
}
