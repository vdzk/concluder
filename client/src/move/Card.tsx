import { Component, For, JSXElement, Show } from "solid-js"
import { A } from "@solidjs/router"

export const Card: Component<{ children: JSXElement; class?: string }> = (props) => (
  <div class={['bg-white rounded-xl px-3 py-3', props.class].filter(Boolean).join(' ')}>
    {props.children}
  </div>
)

export const KebabButton: Component<{ onClick: () => void }> = (props) => (
  <button class="cursor-pointer py-0.5 px-2 hover:bg-gray-100 rounded" onClick={(e) => { e.stopPropagation(); props.onClick() }}>
    <img class="h-5 w-6 dark:invert" src="/menu-kebab-h.svg" />
  </button>
)

export const MenuCard: Component<{ open: boolean; children: JSXElement }> = (props) => (
  <Show when={props.open}>
    <Card>
      <div class="flex flex-wrap items-center gap-2">{props.children}</div>
    </Card>
  </Show>
)

export const RespondButton: Component<{ onClick: () => void }> = (props) => (
  <button class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1" onClick={props.onClick}>
    🎯 Respond
  </button>
)

export const OriginMoveLink: Component<{ moveId: number | null }> = (props) => (
  <Show when={props.moveId !== null}>
    <A href={`/move/${props.moveId}`} class="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1">
      📍 View origin move
    </A>
  </Show>
)

export const PathViewLink: Component<{ claimId: number }> = (props) => (
  <A href={`/argue/${props.claimId}`} class="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1">
    🌿 Path view
  </A>
)

export const ResponseMoveLinks: Component<{ moveIds?: number[] }> = (props) => (
  <Show when={props.moveIds && props.moveIds.length > 0}>
    <For each={props.moveIds}>
      {(id, i) => (
        <A href={`/move/${id}`} class="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1">
          🔍 {props.moveIds!.length === 1 ? 'View response' : `Response ${i() + 1}`}
        </A>
      )}
    </For>
  </Show>
)
