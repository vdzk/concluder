import { Component, Show } from "solid-js"
import { getPercent } from "../utils"

export const LikelihoodBar: Component<{ before: number; after: number, initial?: boolean }> = (props) => {
  const delta = () => props.after - props.before
  const positive = () => delta() >= 0

  // Bar: green portion = after%, red portion = rest
  const afterPct = () => props.after * 100
  const beforePct = () => props.before * 100

  // The delta region sits between before and after (or after and before if negative)
  const deltaLeft = () => Math.min(beforePct(), afterPct())
  const deltaWidth = () => Math.abs(delta()) * 100

  return (
    <div class="flex flex-col gap-1">
      <div class="relative h-7 rounded-full overflow-hidden bg-gray-200">
        {/* Green portion up to the after value */}
        <div
          class="absolute inset-y-0 left-0 bg-green-700"
          style={{ width: `${afterPct()}%` }}
        />
        {/* Delta highlight overlay */}
        <div
          class="absolute inset-y-0"
          classList={{
            'bg-green-400 opacity-40': positive(),
            'bg-red-300 opacity-40': !positive(),
          }}
          style={{ left: `${deltaLeft()}%`, width: `${deltaWidth()}%` }}
        />
        {/* Label centered in the delta section */}
        <div
          class="absolute inset-y-0 flex items-center justify-center text-xs font-bold"
          style={{ left: `${deltaLeft()}%`, width: `${deltaWidth()}%` }}
          classList={{
            'text-white': positive(),
            'text-red-800': !positive()
          }}
        >
          <Show when={!props.initial}>
            <span class="whitespace-nowrap">
              {positive() ? `+${getPercent(delta(), 1)}` : `${getPercent(delta(), 1)}`}
            </span>
          </Show>
        </div>
        {/* Label centered in the leftmost (solid) section */}
        <div
          class="absolute inset-y-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-sm"
          style={{ left: '0%', width: `${deltaLeft()}%` }}
        >
          <span class="whitespace-nowrap">
            {positive() ? getPercent(props.before, 1) : getPercent(props.after, 1)}
          </span>
        </div>
      </div>
    </div>
  )
}
