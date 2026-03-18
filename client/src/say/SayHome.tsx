import { Component } from "solid-js";
import { TextButtonLink } from "../Buttons";

export const SayHome: Component = () => {
  return (
    <main class="w-2xl max-w-full mx-auto bg-white rounded-b">
      <div class="text-2xl py-2 px-2">
        Debates
      </div>
      <div class="px-2 pb-2 flex gap-2">
        <TextButtonLink
          label="Start New"
          color="green"
          href="/say/start-new-debate"
        />
        <TextButtonLink
          label="Unprocessed"
          color="gray"
          href="/say/unprocessed-new-debates"
        />
      </div>
    </main>
  )
}