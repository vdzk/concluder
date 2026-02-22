import { Component } from "solid-js";

export const About: Component = () => {
  return (
    <div class="pt-5 sm:text-lg">
      <p>
        Concluder is an open-source, collaboratively edited website hosting a network of arguments that are scored. The disagreements about the sores are resolved by adding further arguments below and scoring those, repeating the process until a common ground is reached. Every new argument automatically triggers a cascade of score updates reaching all the way up to the original claim.
      </p>
      <br/>
      <p>
        Concluder is too simple to handle many of the complications that arise in a course of a disagreement. Its calculations are too crude to reach accurate conclusions reliably. <a
          href="https://mindofapollo.org/about"
          class="whitespace-nowrap text-sky-700 hover:underline"
        >
          Mind of Apollo
        </a> is the project that aims at overcoming these problems.
      </p>
      <br/>
      <p>
        In fact, concluder.org is a simplified version of the 
        <a
          href="https://mindofapollo.org"
          class="whitespace-nowrap text-sky-700 hover:underline"
        >
          mindofapollo.org
        </a> platform that optimises for ease of use at the cost of nuance and accuracy. Concluder's goal is to demonstrate the potential of the project's approach to solving collaborative reasoning and facilitating productive disagreement on a large scale. If you find it interesting or want to join please let us know on 
        <a
          href="https://discord.gg/3hhhD4tK9h"
          class="whitespace-nowrap text-sky-700 hover:underline"
        >
          Discord
        </a>.
      </p>
    </div>
  )
}