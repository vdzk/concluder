import { Component, JSXElement } from "solid-js"
import { GetMoveResponse } from "../../../shared/types"
import { getPercent } from "../utils"
import { BadgeTarget } from "../move-form/MoveForm"
import { Card } from "./Card"
import { AvatarRow } from "./AvatarRow"
import { NavArrow } from "./NavArrow"
import { TargetEntry } from "./TargetEntry"

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
      <Card badge onBadgeClick={() => props.onBadgeClick('claim')}>
        <div class="text-2xl font-semibold mb-1">{claimStatement.text}</div>
        <div class="flex items-center justify-between text-lg">
          <span title="certainty">🎲 {getPercent(claimStatement.likelihood)}</span>
          <div class="flex items-center gap-2">
            <span>Debate Moves:</span>
            <div class="flex items-center gap-3">
              <NavArrow direction="prev" href={`/move/${nav.prevMoveId ?? ''}`} disabled={nav.prevMoveId === null} />
              <span class="text-lg">{nav.current} / {nav.total}</span>
              <NavArrow direction="next" href={`/move/${nav.nextMoveId ?? ''}`} disabled={nav.nextMoveId === null} />
            </div>
          </div>
        </div>
      </Card>
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
