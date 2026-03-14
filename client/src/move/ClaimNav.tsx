import { Component } from "solid-js"
import { GetMoveResponse } from "../../../shared/types"
import { getPercent } from "../utils"
import { BadgeTarget } from "../move-form/MoveForm"
import { Card } from "./Card"
import { NavArrow } from "./NavArrow"
import { A } from "@solidjs/router"

const NavEnd: Component<{ href: string; disabled: boolean; direction: 'first' | 'last' }> = (props) => (
  <A href={props.href} class={props.disabled ? 'text-gray-300 pointer-events-none' : ''}>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      {props.direction === 'first'
        ? <>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            <line x1="4" y1="5" x2="4" y2="19" stroke-linecap="round" />
          </>
        : <>
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            <line x1="20" y1="5" x2="20" y2="19" stroke-linecap="round" />
          </>
      }
    </svg>
  </A>
)

type Props = {
  claimStatement: GetMoveResponse['claimStatement']
  nav: GetMoveResponse['nav']
  firstMoveId: number | null
  lastMoveId: number | null
  onBadgeClick: (target: BadgeTarget) => void
}

export const ClaimNav: Component<Props> = (props) => (
  <Card badge onBadgeClick={() => props.onBadgeClick('claim')}>
    <div class="text-2xl font-semibold mb-1">{props.claimStatement.text}</div>
    <div class="flex items-center justify-between text-lg">
      <span title="certainty">🎲 {getPercent(props.claimStatement.likelihood)}</span>
      <div class="flex items-center gap-2">
        <span>Debate Moves:</span>
        <div class="flex items-center gap-3">
          <div class="flex items-center">
            <NavEnd direction="first" href={`/move/${props.firstMoveId ?? ''}`} disabled={props.nav.prevMoveId === null} />
            <NavArrow direction="prev" href={`/move/${props.nav.prevMoveId ?? ''}`} disabled={props.nav.prevMoveId === null} />
          </div>
          <span class="text-lg">{props.nav.current} / {props.nav.total}</span>
          <div class="flex items-center">
            <NavArrow direction="next" href={`/move/${props.nav.nextMoveId ?? ''}`} disabled={props.nav.nextMoveId === null} />
            <NavEnd direction="last" href={`/move/${props.lastMoveId ?? ''}`} disabled={props.nav.nextMoveId === null} />
          </div>
        </div>
      </div>
    </div>
  </Card>
)
