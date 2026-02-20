import { useParams } from "@solidjs/router"
import { Component, createEffect, createResource } from "solid-js"
import { rpc } from "./utils"

export const Derivation: Component = () => {
  const params = useParams()
  const [consequence] = createResource(
    () => parseInt(params.argumentId!),
    (argumentId) => rpc('getConsequence', { argumentId })
  )

  createEffect(() => {
    if (consequence()) {
      document.title = consequence()!.outcome
    }
  })

  return (
    <main>
      <div class="max-w-lg mx-auto pb-16">
        <div class="font-bold pt-4">
          Consequence
        </div>
        <div>
          {consequence()?.outcome}
        </div>
        <div class="font-bold pt-4">
          Willingness to pay estimate derivation
        </div>
        <div class="whitespace-pre-line">
          {consequence()?.derivation.replace(/<output\b[^>]*>[\s\S]*?<\/output>/gi, '')}
        </div>
      </div>
    </main>
  )
}