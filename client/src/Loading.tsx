import { Component, createSignal, onMount } from "solid-js";

export const Loading: Component = () => {
  const [visible, setVisible] = createSignal(false)
  onMount(() => {
    setTimeout(() => setVisible(true), 1000)
  })

  return (
    <span classList={{
      'hidden': !visible()
    }}>
      Loading...
    </span>
  )
}