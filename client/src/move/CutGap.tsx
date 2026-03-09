import { Component } from "solid-js";
import { Line } from "./Line";

export const CutGap: Component = () => {
  return (
    <>
      <Line class="h-2 border-b " />
      <div class="h-4" />
      <Line class="h-2 border-t " />
    </>
  )
}