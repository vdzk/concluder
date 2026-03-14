import { useParams } from "@solidjs/router"
import { Component, createEffect, createResource, createSignal, Show, Suspense } from "solid-js"
import { rpc } from "../utils"
import { GetMoveResponse } from "../../../shared/types"
import { MoveForm, BadgeTarget } from "../move-form/MoveForm"
import { MoveContent } from "./MoveContent"

export const Move: Component = () => {
  const params = useParams()
  const [moveData] = createResource<GetMoveResponse, string>(
    () => params.id,
    (id) => rpc('getMove', { id: parseInt(id) })
  )
  const [badgeTarget, setBadgeTarget] = createSignal<BadgeTarget | null>(null)

  createEffect(() => {
    params.id
    setBadgeTarget(null)
  })

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <Show when={moveData()} keyed>
        {(data) => (
          <Show when={badgeTarget() === null} fallback={
            <MoveForm data={data} badgeTarget={badgeTarget()!} onCancel={() => setBadgeTarget(null)} />
          }>
            <MoveContent data={data} onBadgeClick={setBadgeTarget} />
          </Show>
        )}
      </Show>
    </Suspense>
  )
}