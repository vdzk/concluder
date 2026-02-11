import { Component, createSignal, Show } from "solid-js"
import { Button } from "./Button"
import { TextInput } from "./TextInput"
import { getPercent, rpc } from "./utils"
import { Step } from "./Argue"
import { ArgumentDataRow } from "./Argument"
import { ScoreChanges } from "../../shared/types"
import { Delta } from "./Delta"

export interface StatementDataRow {
  id: number,
  text: string,
  likelihood: number,
  justification: string,
  hasArgument: boolean,
  arguments?: ArgumentDataRow[]
}

export const Statement: Component<{
  step: Step
  statement: StatementDataRow
  onShowArguments: (step: Step, argumentId?: number) => Promise<void>
  setScoreChanges: (s: ScoreChanges) => void
  scoreChange?: {old: number, new: number}
}> = props => {
  const [menuOpen, setMenuOpen] = createSignal(false)
  const [argumentFormOpen, setArgumentFormOpen] = createSignal(false)
  const [newArgumentText, setNewArgumentText] = createSignal('')
  const [saving, setSaving] = createSignal(false)

  const onArgumentsShow = () => {
    setMenuOpen(false)
    props.onShowArguments(props.step)
  }

  const onArgumentsAdd = () => {
    setMenuOpen(false)
    setArgumentFormOpen(true)
  }

  const submitArgument = async () => {
    setSaving(true)
    const data = await rpc('addArgument', {
      claim_id: props.step.statementId,
      text: newArgumentText()
    })
    await props.onShowArguments(props.step, data.savedId)
    props.setScoreChanges(data.scoreChanges)
    setArgumentFormOpen(false)
    setSaving(false)
  }
  return (
    <div
      class="
        mt-4 overflow-hidden
        border rounded bg-white 
      "
    >
      <div class="flex">
        <div class="flex-1 px-2 py-1 text-lg relative">
          <span
            class="font-bold inline-block pr-1"
            classList={{
              'text-purple-700': props.step.isClaim,
              'text-gray-700': !props.step.isClaim
            }}
          >
            {props.step.isClaim ? 'Claim:' : 'Premise:'}
          </span>
          {props.statement.text}
          <div
            class="absolute right-2 bottom-1 font-bold text-gray-700"
            title="likelihood that this statement is true"
          >
            <Show when={props.scoreChange}>
              {getPercent(props.scoreChange!.new)}
              <Delta {...props.scoreChange!} />
            </Show>
            <Show when={!props.scoreChange}>
              {getPercent(props.statement.likelihood)}
            </Show>
          </div>
        </div>
        <div
          class="
            shrink-0 border-l text-xl py-1 px-1
            cursor-pointer select-none
            hover:bg-orange-100
          "
          onClick={() => setMenuOpen(prev => !prev)}
        >
          {menuOpen() ? '▲' : '▼'}
        </div>
      </div>
      <Show when={menuOpen()}>
        <div class="border-t px-2 py-2 flex gap-2">
          Arguments:
          <Show when={props.statement.hasArgument}>
            <Button label="Show" onClick={onArgumentsShow} />
          </Show>
          <Button label="Add" onClick={onArgumentsAdd} />
        </div>
      </Show>
      <Show when={argumentFormOpen()}>
        <div class="border-t">
          <TextInput
            placeholder="New argument"
            value={newArgumentText()}
            onChange={setNewArgumentText}
            saving={saving()}
            onSubmit={submitArgument}
            onCancel={() => setArgumentFormOpen(false)}
          />
        </div>
      </Show>
    </div>
  )
}