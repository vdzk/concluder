import { A } from "@solidjs/router"
import { Component } from "solid-js"

export const NavArrow: Component<{ href: string; disabled: boolean; direction: 'prev' | 'next' }> = (props) => (
  <A href={props.href} class={props.disabled ? 'text-gray-300 pointer-events-none' : ''}>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d={props.direction === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
  </A>
)
