import { A, useParams } from "@solidjs/router"
import { Component, createResource, JSX, Show, Suspense } from "solid-js"
import { getPercent, rpc } from "../utils"
import { GetMoveResponse } from "../../../shared/types"

const Card: Component<{ children: JSX.Element; badge?: boolean; class?: string }> = (props) => (
  <div class={['bg-white rounded-xl px-3 py-3', props.badge && 'relative', props.class].filter(Boolean).join(' ')}>
    {props.badge && (
      <span class="absolute -top-2 -right-2 text-base select-none cursor-pointer hover:scale-150 transition-transform inline-block">🎯</span>
    )}
    {props.children}
  </div>
)

const AvatarRow: Component<{ svg: string; name: string; label: JSX.Element }> = (props) => (
  <div class="flex items-center gap-2 text-lg">
    <div innerHTML={props.svg} class="w-8 h-8" />
    <span>{props.name}</span>
    <span>{props.label}</span>
  </div>
)

const NavArrow: Component<{ href: string; disabled: boolean; direction: 'prev' | 'next' }> = (props) => (
  <A href={props.href} class={props.disabled ? 'text-gray-300 pointer-events-none' : ''}>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d={props.direction === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
  </A>
)

export const OneMove: Component = () => {
  const params = useParams()
  const [moveData] = createResource<GetMoveResponse, string>(
    () => params.id,
    (id) => rpc('getMove', { id: parseInt(id) })
  )

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <Show when={moveData()} keyed>
        {(data) => {
          const { move, claimStatement, statement, argument, avatar, nav, targetStatement, targetArgument, targetArgumentClaim } = data
          const isAddClaim = move.type === 'addClaim'
          const targetIsMainClaim = targetStatement?.id === move.claim_id
          const target = targetIsMainClaim ? 'the main claim' : 'it'
          const action: JSX.Element = isAddClaim
            ? 'picked the claim for the debate.'
            : argument.pro
              ? <><span class="text-green-700">defends</span> {target} with an argument:</>
              : <><span class="text-red-700">attacks</span> {target} with an argument:</>

          const targetEntry = move.target_id !== null && (
            targetArgument && move.type !== 'addPremiseArgument' ? (
              <>
                <Card>
                  <AvatarRow svg={avatar.svg} name={avatar.display_name} label="picks an argument:" />
                </Card>
                <Card class="text-lg">
                  <div>{targetArgumentClaim?.text}</div>
                  <div class="font-bold">
                    <span classList={{ 'text-green-700': targetArgument.pro, 'text-red-700': !targetArgument.pro }}>
                      {targetArgument.pro ? 'is true because...' : 'is false because...'}
                    </span>
                  </div>
                  <div>{targetArgument.text}</div>
                </Card>
              </>
            ) : targetStatement && targetStatement.id !== move.claim_id ? (
              <>
                <Card>
                  <AvatarRow svg={avatar.svg} name={avatar.display_name} label="picks a statement:" />
                </Card>
                <Card badge class="text-lg">
                  <div>{targetStatement.text}</div>
                  <div title="certainty" class="text-base mt-1">🎲 {getPercent(targetStatement.likelihood)}</div>
                </Card>
              </>
            ) : null
          )

          return (
            <main class="max-w-2xl mx-auto mt-4 flex flex-col gap-4">
              <Card badge>
                <div class="text-2xl font-semibold mb-1">{claimStatement.text}</div>
                <div class="flex items-center justify-between text-lg">
                  <span title="certainty">🎲 {getPercent(claimStatement.likelihood)}</span>
                  <div class="flex items-center gap-2">
                    <span>Debate Moves:</span>
                    <div class="flex items-center gap-3">
                      <NavArrow direction="prev" href={`/one-move/${nav.prevMoveId ?? ''}`} disabled={nav.prevMoveId === null} />
                      <span class="text-lg">{nav.current} / {nav.total}</span>
                      <NavArrow direction="next" href={`/one-move/${nav.nextMoveId ?? ''}`} disabled={nav.nextMoveId === null} />
                    </div>
                  </div>
                </div>
              </Card>
              {targetEntry}
              <Card>
                <AvatarRow svg={avatar.svg} name={avatar.display_name} label={action} />
              </Card>
              {!isAddClaim && (
                <Card badge>
                  <div class="text-lg mb-1">{argument.text}</div>
                  <div class="text-base" title="argument strength">💪 {getPercent(argument.strength)}</div>
                </Card>
              )}
            </main>
          )
        }}
      </Show>
    </Suspense>
  )
}