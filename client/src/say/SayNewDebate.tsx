import { Component, createSignal, onMount } from "solid-js";
import { TextButton, TextButtonLink } from "../Buttons";
import { etv, rpc } from "../utils";
import { useNavigate, useParams } from "@solidjs/router";

export const SayNewDebate: Component = () => {
  const params = useParams()
  const [text, setText] = createSignal('')
  const [id, setId] = createSignal<number>()
  const navigate = useNavigate()

  onMount(async () => {
    if (params.commentId) {
      const id = parseInt(params.commentId)
      setId(id)
      const comments = await rpc('getComments', { id })
      setText(comments[0].text)
    }
  })

  const onSubmit = async () => {
    if (id()) {
      await rpc('editComment', { id: id(), text: text() })
      navigate('/say/unprocessed-new-debates')
    } else {
      await rpc('addComment', { text: text() })
      navigate('/say/unprocessed-new-debates')
    }
  }

  return (
    <main class="w-2xl max-w-full mx-auto bg-white rounded-b">
      <div class="text-2xl py-2 px-2">
        Start a new Debate
      </div>
      <div class="px-2 pb-2">
        <textarea
          class="w-full px-1 outline-0 border rounded block"
          rows="5"
          value={text()}
          onChange={etv(setText)}
        /></div>
      <div
        class="flex justify-end px-2 pb-2 gap-2"
      >
        <TextButtonLink
          label="Cancel"
          color="gray"
          href="/say"
        />
        <TextButton
          label="Submit"
          color="green"
          onClick={onSubmit}
        />
      </div>
    </main>
  )
}