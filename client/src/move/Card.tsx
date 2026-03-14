import { Component, JSXElement } from "solid-js"

export const Card: Component<{ children: JSXElement; badge?: boolean; class?: string; onBadgeClick?: () => void }> = (props) => (
  <div class={['bg-white rounded-xl px-3 py-3', props.badge && 'relative', props.class].filter(Boolean).join(' ')}>
    {props.badge && (
      <span
        class="absolute -top-2 -right-2 text-base select-none cursor-pointer hover:scale-150 transition-transform inline-block"
        onClick={props.onBadgeClick}
      >🎯</span>
    )}
    {props.children}
  </div>
)
