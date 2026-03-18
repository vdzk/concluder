import { Component, createSignal, For, onMount, Show } from "solid-js"
import { rpc } from "../utils"
import { UnprocessedNewDebateComment } from "../../../shared/types"
import { TextButtonLink } from "../Buttons"

export const UnprocessedNewDebates: Component = () => {
  const [comments, setComments] = createSignal<UnprocessedNewDebateComment[]>([])

  onMount(async () => {
    setComments(await rpc('getComments', {}))
  })

  return (
    <main class="w-2xl max-w-full mx-auto bg-white rounded-b">
      <div class="text-2xl py-2 px-2">
        Unprocessed new Debates
      </div>
      <div class="flex flex-col gap-4 pb-2">
        <For each={comments()}>
          {comment => (
            <div class="px-2">
              <div class="border rounded">
                <div class="px-2 py-2">
                  {comment.text}
                </div>
                <Show when={comment.canEdit}>
                  <div class="border-t flex justify-end px-2 py-2">
                    <TextButtonLink
                      label="Edit"
                      color="green"
                      href={`/say/edit-new-debate/${comment.id}`}
                    />
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
      <div class="px-2 pb-2 flex justify-center">
        <TextButtonLink
          label="Back"
          color="gray"
          href="/say"
        />
      </div>
    </main>
  )
}