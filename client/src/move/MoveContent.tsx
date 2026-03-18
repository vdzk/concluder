import { Component, JSXElement, createSignal } from "solid-js"
import { GetMoveResponse } from "../../../shared/types"
import { getPercent } from "../utils"
import { Card, KebabButton, MenuCard, RespondButton, ResponseMoveLinks } from "./Card"
import { AvatarRow } from "./AvatarRow"
import { TargetEntry } from "./TargetEntry"
import { ClaimNav } from "./ClaimNav"
import { LikelihoodBar } from "./LikelihoodBar"

export const MoveContent: Component<{ data: GetMoveResponse; onBadgeClick: (targetType: 'argument' | 'statement', targetId: number) => void }> = (props) => {
  const { move, claimStatement, argument, avatar, nav, targetStatement, targetArgument, targetArgumentClaim, premiseStatement } = props.data
  const isAddClaim = move.type === 'addClaim'
  const isAddHiddenPremise = move.type === 'addHiddenPremise'
  const targetIsMainClaim = targetStatement?.id === move.claim_id
  const target = targetIsMainClaim ? 'the main claim' : 'it'
  const action: JSXElement = isAddClaim
    ? 'picked the claim for the debate.'
    : isAddHiddenPremise
      ? 'revealed a hidden premise:'
      : argument.pro
        ? <><span class="text-green-700">defends</span> {target} with an argument:</>
        : <><span class="text-red-700">attacks</span> {target} with an argument:</>

  const [openMenu, setOpenMenu] = createSignal<string | null>(null)
  const toggleMenu = (key: string) => setOpenMenu(prev => prev === key ? null : key)

  return (
    <main class="w-2xl max-w-full mx-auto mt-4 flex flex-col gap-4">
      <ClaimNav
        claimStatement={claimStatement}
        claimId={move.claim_id}
        nav={nav}
        firstMoveId={nav.firstMoveId}
        lastMoveId={nav.lastMoveId}
        menuOpen={openMenu() === 'claim'}
        onToggleMenu={() => toggleMenu('claim')}
        onRespond={() => props.onBadgeClick('statement', claimStatement.id)}
        claimResponseMoveIds={props.data.responseMoveIds[`s:${claimStatement.id}`]}
      />
      <TargetEntry
        move={move}
        avatar={avatar}
        targetArgument={targetArgument}
        targetArgumentClaim={targetArgumentClaim}
        targetStatement={targetStatement}
        targetOriginMoveId={props.data.targetOriginMoveId}
        responseMoveIds={props.data.responseMoveIds}
        openMenu={openMenu()}
        onToggleMenu={toggleMenu}
        onRespond={props.onBadgeClick}
      />
      <Card>
        <AvatarRow svg={avatar.svg} name={avatar.display_name} label={action} />
      </Card>
      {!isAddClaim && argument && (
        <>
          <Card>
            <div class="text-lg mb-1">{argument.text}</div>
            <div class="flex items-center justify-between text-base">
              <span title="argument strength">💪 {getPercent(argument.strength)}</span>
              <KebabButton onClick={() => toggleMenu('argument')} />
            </div>
          </Card>
          <MenuCard open={openMenu() === 'argument'}>
            <RespondButton onClick={() => props.onBadgeClick('argument', argument.id)} />
            <ResponseMoveLinks moveIds={props.data.responseMoveIds[`a:${argument.id}`]} />
          </MenuCard>
        </>
      )}
      {isAddHiddenPremise && premiseStatement && (
        <>
          <Card>
            <div class="text-lg mb-1">{premiseStatement.text}</div>
            <div class="flex items-center justify-between text-base">
              <span title="certainty">🎲 {getPercent(premiseStatement.likelihood)}</span>
              <KebabButton onClick={() => toggleMenu('premise')} />
            </div>
          </Card>
          <MenuCard open={openMenu() === 'premise'}>
            <RespondButton onClick={() => props.onBadgeClick('statement', premiseStatement.id)} />
            <ResponseMoveLinks moveIds={props.data.responseMoveIds[`s:${premiseStatement.id}`]} />
          </MenuCard>
        </>
      )}
      <Card>
        <div class="text-lg pb-2">
          {`Main claim ${isAddClaim ? 'initial 🎲' : '🎲 change'}`}
        </div>
        <LikelihoodBar
          before={move.claim_likelihood_before}
          after={move.claim_likelihood_after}
          initial={isAddClaim}
        />
      </Card>
    </main>
  )
}
