import { Component, JSXElement } from "solid-js"
import { GetMoveResponse } from "../../../shared/types"
import { getPercent } from "../utils"
import { BadgeTarget } from "../move-form/MoveForm"
import { Card } from "./Card"
import { AvatarRow } from "./AvatarRow"
import { TargetEntry } from "./TargetEntry"
import { ClaimNav } from "./ClaimNav"

export const MoveContent: Component<{ data: GetMoveResponse; onBadgeClick: (target: BadgeTarget) => void }> = (props) => {
  const { move, claimStatement, argument, avatar, nav, targetStatement, targetArgument, targetArgumentClaim } = props.data
  const isAddClaim = move.type === 'addClaim'
  const targetIsMainClaim = targetStatement?.id === move.claim_id
  const target = targetIsMainClaim ? 'the main claim' : 'it'
  const action: JSXElement = isAddClaim
    ? 'picked the claim for the debate.'
    : argument.pro
      ? <><span class="text-green-700">defends</span> {target} with an argument:</>
      : <><span class="text-red-700">attacks</span> {target} with an argument:</>

  return (
    <main class="w-2xl max-w-full mx-auto mt-4 flex flex-col gap-4">
      <ClaimNav
        claimStatement={claimStatement}
        nav={nav}
        firstMoveId={nav.firstMoveId}
        lastMoveId={nav.lastMoveId}
        onBadgeClick={props.onBadgeClick}
      />
      <TargetEntry
        move={move}
        avatar={avatar}
        targetArgument={targetArgument}
        targetArgumentClaim={targetArgumentClaim}
        targetStatement={targetStatement}
        onBadgeClick={props.onBadgeClick}
      />
      <Card>
        <AvatarRow svg={avatar.svg} name={avatar.display_name} label={action} />
      </Card>
      {!isAddClaim && (
        <Card badge onBadgeClick={() => props.onBadgeClick('argument')}>
          <div class="text-lg mb-1">{argument.text}</div>
          <div class="text-base" title="argument strength">💪 {getPercent(argument.strength)}</div>
        </Card>
      )}
    </main>
  )
}
