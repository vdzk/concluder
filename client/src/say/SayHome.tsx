import { Component, For, onMount } from "solid-js"
import { TextButtonLink } from "../Buttons"
import { createStore } from "solid-js/store"
import { rpc } from "../utils"
import { A } from "@solidjs/router"

interface Statement {
  id: number,
  text: string,
  likelihood: number
}

export const SayHome: Component = () => {
  const [statements, setStatements] = createStore<Statement[]>([])

  onMount(async () => {
    const statements = await rpc('getExposedClaims', {})
    setStatements(statements)
  })

  return (
    <main class="w-2xl max-w-full mx-auto bg-white rounded-b">
      <div class="text-2xl py-2 px-2">
        Debates
      </div>
      <div class="px-2 pb-2 flex gap-2">
        <TextButtonLink
          label="Start New"
          color="green"
          href="/say/start-new-debate"
        />
        <TextButtonLink
          label="Unprocessed"
          color="gray"
          href="/say/unprocessed-new-debates"
        />
      </div>
      <div class="flex font-bold px-2">
        <div>Claim</div>
        <div class="flex-1" />
        <div>Confidence</div>
      </div>
      <For each={statements}>
        {statement => (
          <A
            href={`/say/claim/${statement.id}`}
            class="flex px-2 border-t py-1 hover:bg-orange-200 text-lg gap-2"
          >
            <div class="flex-1">
              {statement.text}
            </div>
            <div>
              {statement.likelihood * 100}%
            </div>
          </A>
        )}
      </For>
    </main>
  )
}