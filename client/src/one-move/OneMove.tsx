import { A, useParams } from "@solidjs/router"
import { Component, createResource, Show, Suspense } from "solid-js"
import { getPercent, rpc } from "../utils"
import { GetMoveResponse } from "../../../shared/types"

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
          const action = isAddClaim
            ? 'picked the claim for the debate.'
            : argument.pro
              ? <><span class="text-green-700">defends</span> {target} with an argument:</>
              : <><span class="text-red-700">attacks</span> {target} with an argument:</>

          const targetEntry = move.target_id !== null && (
            targetArgument && move.type !== 'addPremiseArgument' ? (
              <>
                <div class="bg-white rounded-xl px-3 py-3">
                  <div class="flex items-center gap-2 text-lg">
                    <div innerHTML={avatar.svg} class="w-8 h-8" />
                    <span>{avatar.display_name}</span>
                    <span>picks an argument:</span>
                  </div>
                </div>
                <div class="bg-white rounded-xl px-3 py-3 text-lg">
                  <div>
                    {targetArgumentClaim?.text}
                  </div>
                  <div class="font-bold">
                    <span classList={{
                      'text-green-700': targetArgument.pro,
                      'text-red-700': !targetArgument.pro
                    }}>
                      {targetArgument.pro ? 'is true because...' : 'is false because...'}
                    </span>
                  </div>
                  <div>{targetArgument.text}</div>
                </div>
              </>
            ) : targetStatement && targetStatement.id !== move.claim_id ? (
              <>
                <div class="bg-white rounded-xl px-3 py-3">
                  <div class="flex items-center gap-2 text-lg">
                    <div innerHTML={avatar.svg} class="w-8 h-8" />
                    <span>{avatar.display_name}</span>
                    <span>picks a statement:</span>
                  </div>
                </div>
                <div class="bg-white rounded-xl px-3 py-3 text-lg">
                  <div>{targetStatement.text}</div>
                  <div class="text-base opacity-60 mt-1">
                    Certainty: {getPercent(targetStatement.likelihood)}
                  </div>
                </div>
              </>
            ) : null
          )

          return (
            <main class="max-w-2xl mx-auto mt-4 flex flex-col gap-4">
              <div class="bg-white rounded-xl px-3 py-3">
                <div class="text-2xl font-semibold mb-1">{claimStatement.text}</div>
                <div class="flex items-center justify-between text-lg ">
                  <span class="opacity-60">Certainty: {getPercent(claimStatement.likelihood)}</span>
                  <div class="flex items-center gap-2">
                    <span>Debate Moves:</span>
                    <div class="flex items-center gap-3">
                      <A href={`/one-move/${nav.prevMoveId ?? ''}`} class={nav.prevMoveId === null ? 'text-gray-300 pointer-events-none' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </A>
                      <span class="text-lg">{nav.current} / {nav.total}</span>
                      <A href={`/one-move/${nav.nextMoveId ?? ''}`} class={nav.nextMoveId === null ? 'text-gray-300 pointer-events-none' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </A>
                    </div>
                  </div>
                </div>
              </div>
              {targetEntry}
              <div class="bg-white rounded-xl px-3 py-3">
                <div class="flex items-center gap-2 text-lg">
                  <div innerHTML={avatar.svg} class="w-8 h-8" />
                  <span>{avatar.display_name}</span>
                  <span>{action}</span>
                </div>
              </div>
              {!isAddClaim && (
                <div class="bg-white rounded-xl px-3 py-3">
                  <div class="text-lg mb-1">
                    {argument.text}
                  </div>
                  <div class="text-base opacity-60">
                    Strength: {getPercent(argument.strength)}
                  </div>
                </div>
              )}
            </main>
          )
        }}
      </Show>
    </Suspense>
  )
}