import { Component } from "solid-js";
import { Line } from "./Line";

export const CutGap: Component = () => {
  return (
    <>
      <Line class="h-2" />
      <div class="h-4 bg-white" />
      <Line class="h-2 " />
    </>
  )
}