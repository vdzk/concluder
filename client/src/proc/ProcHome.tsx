import { Component, createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { CommentRecord } from "../../../shared/types"
import { etv, rpc } from "../utils"
import { TextButton } from "../Buttons"
import { createStore, produce } from "solid-js/store"

const entryTypes = ['claim', 'prem', 'pro', 'con'] as const
type EntryType = typeof entryTypes[number]

interface Entry {
  id: number,
  text: string,
  targetId?: number,
  score?: number,
  type?: EntryType,
}

export const ProcHome: Component = () => {
  const [comment, setComment] = createSignal<CommentRecord>()
  const [nextEntryId, setNextEntryId] = createSignal(1)
  const [entries, setEntries] = createStore<Record<number, Entry>>({})

  const saveToStorage = () => {
    localStorage.setItem('procEntries', JSON.stringify(entries))
  }

  onMount(async () => {
    const comments: CommentRecord[] = await rpc('getComments', { procNext: true })
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

  const onSubmit = () => {
    
  }

  return (
    <div class="w-2xl">
      <div class="px-2 pt-2 pb-4">
        <div class="bg-white border rounded">
          <div class="px-2 py-2 text-2xl">Task: Process new Debate</div>
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
          {entry => (
            <div class="px-2">
              <div class="border rounded bg-white">
                <div class="border-b flex">
                  <div class="font-bold px-1">
                    {entry.id}
                  </div>
                  <select
                    value={entry.type ?? ''}
                    onChange={etv(v => setEntries(entry.id, { type: v as EntryType || undefined }))}
                  >
                    <option value=""></option>
                    <For each={entryTypes}>{t => <option value={t}>{t}</option>}</For>
                  </select>
                  <input
                    class="outline-0 border rounded w-6 px-1"
                    type="text"
                    value={entry.targetId ?? ''}
                    onInput={etv(v => setEntries(entry.id, { targetId: v ? Number(v) : undefined }))}
                  />
                  <input
                    class="outline-0 border rounded w-10 px-1 ml-1"
                    type="text"
                    value={entry.score ?? ''}
                    onInput={etv(v => setEntries(entry.id, { score: v ? Number(v) : undefined }))}
                  />
                  %
                  <div class="flex-1"/>
                  <TextButton
                    label="X"
                    color="gray"
                    onClick={() => setEntries(produce(s => { delete s[entry.id] }))}
                  />
                </div>
                <textarea
                  class="outline-0 w-full block px-1"
                  value={entry.text}
                  onInput={etv(text => setEntries(entry.id, {text}))}
                />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}