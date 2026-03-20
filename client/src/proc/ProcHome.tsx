import { Component, createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { CommentRecord } from "../../../shared/types"
import { rpc } from "../utils"
import { TextButton } from "../Buttons"
import { createStore } from "solid-js/store"
import { Entry, EntryCard } from "./EntryCard"
import { ExistingEntries } from "./ExistingEntries"

export const ProcHome: Component = () => {
  const [comment, setComment] = createSignal<CommentRecord>()
  const [nextEntryId, setNextEntryId] = createSignal(1)
  const [entries, setEntries] = createStore<Record<number, Entry>>({})

  const saveToStorage = () => {
    localStorage.setItem('procEntries', JSON.stringify(entries))
  }

  onMount(async () => {
    const comments: CommentRecord[] = await rpc('getComments', {
      processed: false,
      single: true
    })
    setComment(comments[0])

    const saved = localStorage.getItem('procEntries')
    if (saved) {
      const parsed: Record<number, Entry> = JSON.parse(saved)
      setEntries(parsed)
      const maxId = Math.max(0, ...Object.keys(parsed).map(Number))
      setNextEntryId(maxId + 1)
    }

    window.addEventListener('beforeunload', saveToStorage)
  })

  onCleanup(() => {
    saveToStorage()
    window.removeEventListener('beforeunload', saveToStorage)
  })

  const addEntry = () => {
    const newEntry = {
      id: nextEntryId(),
      text: ''
    }
    setEntries(newEntry.id, newEntry)
    setNextEntryId(prev => prev + 1)
  }

  const onSubmit = async () => {
    const results = await rpc('applyCommentChanges', {
      commentId: comment()!.id,
      entries
    })
    console.log('results', results)
  }

  const isNewDebate = () => comment()?.argument_id === null && comment()?.statement_id === null

  return (
    <div class="flex">
      <div class="w-2xl">
        <div class="px-2 pt-2 pb-4">
          <div class="bg-white border rounded">
            <div class="px-2 py-2 text-2xl">
              Task: Process new {isNewDebate() ? 'Debate' : 'Comment'}
            </div>
            <Show when={comment()}>
              <div class="px-2 pb-2">
                {comment()!.text}
              </div>
            </Show>
            <div class="px-2 pb-2 flex">
              <TextButton
                label="Add Entry"
                color="green"
                onClick={addEntry}
              />
              <div class="flex-1" />
              <TextButton
                label="Submit"
                color="green"
                onClick={onSubmit}
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4 pb-2">
          <For each={Object.values(entries)}>
            {entry => <EntryCard entry={entry} setEntries={setEntries} />}
          </For>
        </div>
      </div>
      <ExistingEntries comment={comment()} nextEntryId={nextEntryId} setNextEntryId={setNextEntryId} />
    </div>
  )
}