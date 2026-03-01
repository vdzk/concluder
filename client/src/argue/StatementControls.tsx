import { createSignal, Show, type Component, type Setter } from "solid-js"
import { produce, type SetStoreFunction } from "solid-js/store"
import { rpc } from "../utils"
import { ArgumentFormData, PremiseFormData, ScoreChanges } from "../../../shared/types"
import { IconButton } from "../Buttons"
import { ArgumentForm } from "../ArgumentForm"
import { StatementForm } from "../StatementForm"
import { StatementDataRow } from "./Statement"
import type { Step, ArgumentLocation } from "./types"
import { ReportForm } from "../ReportForm"

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
    props.setPath(prev => prev.slice(0, step.index + 1))
    props.setPath(step.index, 'argumentIndex', undefined)
    props.setPath(step.index, 'premiseIndex', undefined)
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
    setEditingStatement(false)
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

  const [editingStatement, setEditingStatement] = createSignal(false)
  const [savingEdit, setSavingEdit] = createSignal(false)

  const onEditStatement = (step: Step) => {
    onHideArguments(step)
    props.setArgumentFormId()
    setEditingStatement(true)
  }

  const submitEditStatement = async (step: Step, formData: PremiseFormData) => {
    setSavingEdit(true)
    const data = await rpc('editStatement', {
      id: step.statementId,
      ...formData
    })
    props.setStatements(step.statementId, { text: formData.text, likelihood: formData.likelihood })
    props.shiftScores(data.scoreChanges)
    setEditingStatement(false)
    setSavingEdit(false)
  }

  const [reportsOpen, setReportsOpen] = createSignal(false)

  const statement = () => props.statements[props.step.statementId]

  return (
    <>
      <div class="flex select-none">
        <div class="w-[calc(50%-18px)]" />
        <Show when={
          props.step.argumentIndex === undefined &&
          statement().hasArgument
        }>
          <IconButton
            label="show arguments"
            iconName="chevron-down"
            onClick={() => onShowArguments(props.step)}
          />
        </Show>
        <Show when={props.step.argumentIndex !== undefined}>
          <IconButton
            label="hide arguments"
            iconName="chevron-up"
            onClick={() => onHideArguments(props.step)}
          />
        </Show>
        <Show when={
          props.step.argumentIndex !== undefined &&
          (statement().arguments?.length ?? 0) > 1
        }>
          <IconButton
            iconName="arrow-left"
            onClick={() => onShiftArgument(props.step, -1)}
            disabled={props.step.argumentIndex === 0}
            label="prev. argument"
          />
          <IconButton
            iconName="arrow-right"
            onClick={() => onShiftArgument(props.step, 1)}
            disabled={props.step.argumentIndex! === (statement().arguments?.length ?? 0) - 1}
            label="next argument"
          />
        </Show>
        <Show when={props.argumentFormId() !== props.step.statementId}>
          <IconButton
            label="add argument"
            iconName="plus"
            onClick={() => onShowArgumentForm(props.step)}
          />
        </Show>
        <Show when={props.argumentFormId() === props.step.statementId}>
          <IconButton
            label="cancel"
            iconName="minus"
            onClick={() => props.setArgumentFormId()}
          />
        </Show>
        <Show when={statement().editable}>
          <Show when={!editingStatement()}>
            <IconButton
              label={`edit ${props.step.isClaim ? 'claim' : 'premise'}`}
              iconName="edit"
              onClick={() => onEditStatement(props.step)}
            />
          </Show>
          <Show when={editingStatement()}>
            <IconButton
              label="cancel edit"
              iconName="edit-cancel"
              onClick={() => setEditingStatement(false)}
            />
          </Show>
          <IconButton
            label="delete"
            iconName="delete"
            onClick={() => onDeleteStatement(props.step)}
          />
        </Show>
        <Show when={!statement().editable}>
          <Show when={reportsOpen()}>
            <IconButton
              label="close reports"
              iconName="flag-cancel"
              onClick={() => setReportsOpen(false)}
            />
          </Show>
          <Show when={!reportsOpen()}>
            <IconButton
              label="report a problem"
              iconName="flag"
              onClick={() => setReportsOpen(true)}
            />
          </Show>
        </Show>
      </div>
      <Show when={reportsOpen()}>
        <ReportForm
          type={props.step.isClaim ? 'claim' : 'premise'}
          id={props.step.statementId}
        />
      </Show>
      <Show when={editingStatement()}>
        <StatementForm
          saving={savingEdit()}
          onSubmitStatement={(data) => submitEditStatement(props.step, data)}
          initialData={{
            text: statement().text,
            likelihood: statement().likelihood
          }}
          hasArgument={statement().hasArgument}
          isClaim={props.step.isClaim}
        />
      </Show>
      <Show when={props.argumentFormId() === props.step.statementId}>
        <ArgumentForm
          saving={props.savingArgument()}
          onSubmitArgument={(data) => submitArgument(props.step, data)}
        />
      </Show>
    </>
  )
}
