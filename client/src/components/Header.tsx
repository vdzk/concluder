import { A } from '@solidjs/router'
import { Component } from 'solid-js'

export const Header: Component = () => (
  <header class="w-full border-b bg-lime-800 text-white">
    <div class="mx-auto flex items-center px-6">
      <A href="/" class="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
        Concluder – Home
      </A>
    </div>
  </header>
)
