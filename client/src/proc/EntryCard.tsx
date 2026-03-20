import { Component, For } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { produce } from "solid-js/store"
import { etv } from "../utils"
import { TextButton } from "../Buttons"

export const entryTypes = ['claim', 'prem', 'pro', 'con'] as const
export type EntryType = typeof entryTypes[number]

export interface Entry {
  id: number,
  text: string,
  targetId?: number,
  score?: number,
  type?: EntryType,
}

interface Props {
  entry: Entry,
  setEntries: SetStoreFunction<Record<number, Entry>>,
}

export const EntryCard: Component<Props> = ({ entry, setEntries }) => (
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
)
