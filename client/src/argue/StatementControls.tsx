import { Show, type Component, type Setter } from "solid-js"
import { produce, type SetStoreFunction } from "solid-js/store"
import { rpc } from "../utils"
import { ArgumentFormData, ScoreChanges } from "../../../shared/types"
import { IconButton } from "../Buttons"
import { ArgumentForm } from "../ArgumentForm"
import { StatementDataRow } from "./Statement"
import type { Step, ArgumentLocation } from "./types"

export const StatementControls: Component<{
  step: Step
  onClaimDeleted: () => void
  statements: Record<number, StatementDataRow>
  setStatements: SetStoreFunction<Record<number, StatementDataRow>>
  setArgumentLocations: SetStoreFunction<Record<number, ArgumentLocation>>
  path: Step[]
  setPath: SetStoreFunction<Step[]>
  argumentFormId: () => number | undefined
  setArgumentFormId: Setter<number | undefined>
  savingArgument: () => boolean
  setSavingArgument: Setter<boolean>
  shiftScores: (scoreChanges: ScoreChanges) => void
}> = (props) => {

  const onShowArguments = async (step: Step, argumentId?: number) => {
    props.setArgumentFormId()
    const { statementId } = step
    const _arguments = await rpc(
      'getArgumentsByClaimId',
      { claimId: statementId }
    )
    props.setStatements(step.statementId, 'arguments', _arguments)
    for (let argumentIndex = 0; argumentIndex < _arguments.length; argumentIndex++) {
      props.setArgumentLocations(_arguments[argumentIndex].id, {
        statementId,
        argumentIndex
      })
    }
    if (_arguments?.length) {
      let newArgumentIndex = -1
      if (argumentId) {
        newArgumentIndex = _arguments.findIndex((a: any) => a.id === argumentId)
      }
      if (newArgumentIndex === -1 && step.argumentIndex === undefined) {
        newArgumentIndex = 0
      }
      if (newArgumentIndex !== -1) {
        props.setPath(step.index, 'argumentIndex', newArgumentIndex)
      }
    } else {
      props.setStatements(step.statementId, 'hasArgument', false)
    }
  }

  const onHideArguments = (step: Step) => {
    props.setPath(prev => [
      ...prev.slice(0, step.index), {
        ...step,
        argumentIndex: undefined,
        premiseIndex: undefined
      }
    ])
  }

  const onShiftArgument = (step: Step, argumentIndexDelta: number) => {
    const newArgumentIndex = step.argumentIndex! + argumentIndexDelta
    props.setPath(prevPath => [...prevPath.slice(0, step.index), {
      ...step,
      argumentIndex: newArgumentIndex,
      premiseIndex: undefined
    }])
  }

  const onShowArgumentForm = (step: Step) => {
    onHideArguments(step)
    props.setArgumentFormId(step.statementId)
  }

  const onDeleteStatement = async (step: Step) => {
    if (confirm(`Delete the ${step.isClaim ? 'claim' : 'premise'} above?`)) {
      const data = await rpc('deleteStatement', { id: step.statementId })
      if (step.isClaim) {
        props.onClaimDeleted()
      } else {
        const prevStep = props.path[step.index - 1]
        props.setStatements(prevStep.statementId, 'arguments', prevStep.argumentIndex!,
          (produce(prevArgument => {
            prevArgument.premises!.splice(prevStep.premiseIndex!, 1)
            if (prevArgument.premises!.length === 0) {
              prevArgument.hasPremise = false
            }
          }))
        )
        props.shiftScores(data.scoreChanges)
        props.setPath(prevPath => prevPath.slice(0, step.index))
        props.setPath(step.index - 1, 'premiseIndex', undefined)
      }
    }
  }

  const submitArgument = async (step: Step, argumentFormData: ArgumentFormData) => {
    props.setSavingArgument(true)
    const data = await rpc('addArgument', {
      claim_id: step.statementId,
      ...argumentFormData
    })
    await onShowArguments(step, data.savedId)
    props.setStatements(step.statementId, 'hasArgument', true)
    props.shiftScores(data.scoreChanges)
    props.setArgumentFormId()
    props.setSavingArgument(false)
  }

  const step = () => props.step

  return (
    <>
      <div class="flex select-none">
        <div class="w-[calc(50%-18px)]" />
        <Show when={
          step().argumentIndex === undefined &&
          props.statements[step().statementId].hasArgument
        }>
          <IconButton
            label="show arguments"
            iconName="chevron-down"
            onClick={() => onShowArguments(step())}
          />
        </Show>
        <Show when={step().argumentIndex !== undefined}>
          <IconButton
            label="hide arguments"
            iconName="chevron-up"
            onClick={() => onHideArguments(step())}
          />
        </Show>
        <Show when={
          step().argumentIndex !== undefined &&
          (props.statements[step().statementId].arguments?.length ?? 0) > 1
        }>
          <IconButton
            iconName="arrow-left"
            onClick={() => onShiftArgument(step(), -1)}
            disabled={step().argumentIndex === 0}
            label="prev. argument"
          />
          <IconButton
            iconName="arrow-right"
            onClick={() => onShiftArgument(step(), 1)}
            disabled={step().argumentIndex! === (props.statements[step().statementId].arguments?.length ?? 0) - 1}
            label="next argument"
          />
        </Show>
        <Show when={props.argumentFormId() !== step().statementId}>
          <IconButton
            label="add argument"
            iconName="plus"
            onClick={() => onShowArgumentForm(step())}
          />
        </Show>
        <Show when={props.argumentFormId() === step().statementId}>
          <IconButton
            label="cancel"
            iconName="minus"
            onClick={() => props.setArgumentFormId()}
          />
        </Show>
        <Show when={props.statements[step().statementId].editable}>
          <IconButton
            label="delete"
            iconName="delete"
            onClick={() => onDeleteStatement(step())}
          />
        </Show>
      </div>
      <Show when={props.argumentFormId() === step().statementId}>
        <ArgumentForm
          saving={props.savingArgument()}
          onSubmitArgument={(data) => submitArgument(step(), data)}
        />
      </Show>
    </>
  )
}
