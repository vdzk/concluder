import { useNavigate, useParams } from "@solidjs/router"
import { Component, createResource, Show, Suspense } from "solid-js"
import { rpc } from "../utils"
import { GetMoveResponse } from "../../../shared/types"
import { MoveContent } from "./MoveContent"
import { Loading } from "../Loading"

export const Move: Component = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [moveData] = createResource<GetMoveResponse, string>(
    () => params.id,
    (id) => rpc('getMove', { id: parseInt(id) })
  )

  return (
    <Suspense fallback={<Loading />}>
      <Show when={moveData()} keyed>
        {(data) => <MoveContent data={data} onBadgeClick={(targetType, targetId) => {
          navigate(`/respond/${targetType}/${targetId}/${data.move.claim_id}/${params.id}`)
        }} />}
      </Show>
    </Suspense>
  )
}