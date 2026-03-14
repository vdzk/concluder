import { Component, createSignal, onMount } from "solid-js";

export const Loading: Component = () => {
  const [visible, setVisible] = createSignal(false)
  onMount(() => {
    setTimeout(() => setVisible(true), 2000)
  })

  return (
    <span classList={{
      'hidden': !visible()
    }}>
      Loading...
    </span>
  )
}