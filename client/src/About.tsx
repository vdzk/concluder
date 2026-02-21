import { Component } from "solid-js";

export const About: Component = () => {
  return (
    <div class="pt-5 sm:text-lg">
      <p>
        This is an open-source, collaboratively edited website hosting a network of arguments that are scored. The disagreements about the sores are resolved by adding further arguments below and scoring those, repeating the process until a common ground is reached. Every new argument automatically triggers a cascade of sore updates reaching all the way up to the original claim.
      </p>
      <br/>
      <p>
        This is a simplified version of the platform. Its goal is to demonstrate the potential of this approach to collaborative reasoning. The full version will need to handle a lot of complications that arise in a course of a disagreement. If you find this approach interesting please consider checking out and contributing to the the progress of the 
        <a
          href="https://mindofapollo.org/about"
          class="whitespace-nowrap text-sky-700 hover:underline"
        >
          full version of the platform
        </a>.
      </p>
    </div>
  )
}