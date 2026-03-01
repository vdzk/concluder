import { createSignal, Show, type Component, type Setter } from "solid-js"
import { type SetStoreFunction } from "solid-js/store"
import { rpc } from "../utils"
import { ArgumentFormData, PremiseFormData, ScoreChanges } from "../../../shared/types"
import { IconButton } from "../Buttons"
import { ArgumentForm } from "../ArgumentForm"
import { StatementForm } from "../StatementForm"
import { StatementDataRow } from "./Statement"
import type { ArgumentDataRow } from "./Argument"
import type { Step } from "./types"
import { ReportForm } from "../ReportForm"

export const ArgumentControls: Component<{
  step: Step
  stepIndex: () => number
  statements: Record<number, StatementDataRow>
  setStatements: SetStoreFunction<Record<number, StatementDataRow>>
  path: Step[]
  setPath: SetStoreFunction<Step[]>
  premiseFormId: () => number | undefined
  setPremiseFormId: Setter<number | undefined>
  savingPremise: () => boolean
  setSavingPremise: Setter<boolean>
  shiftScores: (scoreChanges: ScoreChanges) => void
  getArgumentByStep: (step: Step) => ArgumentDataRow
}> = (props) => {
  const getNumPremises = (step: Step) =>
    (props.statements[step.statementId].arguments![step.argumentIndex!].premises?.length ?? 0)

  const hasPremise = (step: Step) =>
    (props.statements[step.statementId].arguments![step.argumentIndex!].hasPremise)

  const onShowPremises = async (step: Step, premiseId?: number, reload?: boolean) => {
    const claim = props.statements[step.statementId]
    if (step.argumentIndex === undefined) return
    const argument = claim.arguments![step.argumentIndex]
    let premises = argument.premises
    if (!premises || reload) {
      const premisesData = await rpc(
        'getPremisesByArgumentId',
        { argumentId: argument.id }
      )
      for (const statement of premisesData.statements) {
        props.setStatements(statement.id, statement)
      }
      props.setStatements(
        step.statementId, 'arguments', step.argumentIndex,
        'premises', premisesData.premises
      )
      premises = premisesData.premises
    }
    if (premises?.length) {
      let newPremiseIndex = -1
      if (premiseId) {
        newPremiseIndex = premises.findIndex(p => p.id === premiseId)
      }
      if (newPremiseIndex === -1 && step.premiseIndex === undefined) {
        newPremiseIndex = 0
      }
      if (newPremiseIndex !== -1) {
        props.setPath(step.index, 'premiseIndex', newPremiseIndex)
        const newStepIndex = step.index + 1
        props.setPath(newStepIndex, {
          index: newStepIndex,
          statementId: premises[newPremiseIndex].statement_id
        })
      }
    }
  }

  const onHidePremises = (step: Step) => {
    props.setPath(prev => prev.slice(0, step.index + 1))
    props.setPath(step.index, 'premiseIndex', undefined)
  }

  const onShiftPremise = (step: Step, premiseIndexDelta: number) => {
    const newPremiseIndex = step.premiseIndex! + premiseIndexDelta
    props.setPath(step.index, 'premiseIndex', newPremiseIndex)
    const nextStatementId = props.statements[step.statementId]
      .arguments![step.argumentIndex!]
      .premises![newPremiseIndex]
      .statement_id
    const newStepIndex = step.index + 1
    props.setPath(prev => [
      ...prev.slice(0, newStepIndex), {
        index: newStepIndex,
        statementId: nextStatementId
      }
    ])
  }

  const onShowPremiseForm = (step: Step) => {
    onHidePremises(step)
    setEditingArgument(false)
    props.setPremiseFormId(step.statementId)
  }

  const onDeleteArgument = async (step: Step) => {
    if (confirm(`Delete the argument above?`)) {
      const argument = props.getArgumentByStep(step)
      const data = await rpc('deleteArgument', { id: argument.id })
      props.shiftScores(data.scoreChanges)
      const newPath = [
        ...props.path.slice(0, step.index),
        { ...step, argumentIndex: undefined, premiseIndex: undefined }
      ]
      props.setPath(newPath)
    }
  }

  const submitPremise = async (step: Step, premiseFormData: PremiseFormData) => {
    props.setSavingPremise(true)
    const argumentId = props.statements[step.statementId].arguments![step.argumentIndex!].id
    const data = await rpc('addPremise', {
      argument_id: argumentId,
      ...premiseFormData
    })
    props.setPremiseFormId()
    props.setSavingPremise(false)
    props.setStatements(step.statementId, 'arguments', step.argumentIndex!, 'hasPremise', true)
    await onShowPremises(step, data.savedId, true)
    props.shiftScores(data.scoreChanges)
  }

  const [editingArgument, setEditingArgument] = createSignal(false)
  const [savingEdit, setSavingEdit] = createSignal(false)

  const onEditArgument = (step: Step) => {
    onHidePremises(step)
    props.setPremiseFormId()
    setEditingArgument(true)
  }

  const submitEditArgument = async (step: Step, argumentFormData: ArgumentFormData) => {
    setSavingEdit(true)
    const argument = props.getArgumentByStep(step)
    const data = await rpc('editArgument', {
      id: argument.id,
      ...argumentFormData
    })
    props.setStatements(
      step.statementId, 'arguments', step.argumentIndex!,
      { text: argumentFormData.text, pro: argumentFormData.pro, strength: argumentFormData.strength }
    )
    props.shiftScores(data.scoreChanges)
    setEditingArgument(false)
    setSavingEdit(false)
  }

  const [reportsOpen, setReportsOpen] = createSignal(false)

  const step = () => props.step

  return (
    <>
      <div class="flex select-none">
        <div class="w-[calc(50%-18px)]" />
        <Show when={hasPremise(step())}>
          <Show when={step().premiseIndex === undefined}>
            <IconButton
              label="show premises"
              iconName="chevron-down"
              onClick={() => onShowPremises(step())}
            />
          </Show>
          <Show when={step().premiseIndex !== undefined}>
            <IconButton
              label="hide premises"
              iconName="chevron-up"
              onClick={() => onHidePremises(step())}
            />
          </Show>
        </Show>
        <Show when={
          props.stepIndex() + 1 < props.path.length &&
          getNumPremises(step()) > 1
        }>
          <IconButton
            iconName="arrow-left"
            onClick={() => onShiftPremise(step(), -1)}
            disabled={step().premiseIndex === 0}
            label="prev. premise"
          />
          <IconButton
            iconName="arrow-right"
            onClick={() => onShiftPremise(step(), 1)}
            disabled={step().premiseIndex === getNumPremises(step()) - 1}
            label="next premise"
          />
        </Show>
        <Show when={props.premiseFormId() !== step().statementId}>
          <IconButton
            label="add premise"
            iconName="plus"
            onClick={() => onShowPremiseForm(step())}
          />
        </Show>
        <Show when={props.premiseFormId() === step().statementId}>
          <IconButton
            label="cancel"
            iconName="minus"
            onClick={() => props.setPremiseFormId()}
          />
        </Show>
        <Show when={props.getArgumentByStep(step()).editable}>
          <Show when={!editingArgument()}>
            <IconButton
              label="edit"
              iconName="edit"
              onClick={() => onEditArgument(step())}
            />
          </Show>
          <Show when={editingArgument()}>
            <IconButton
              label="cancel edit"
              iconName="edit-cancel"
              onClick={() => setEditingArgument(false)}
            />
          </Show>
          <IconButton
            label="delete"
            iconName="delete"
            onClick={() => onDeleteArgument(step())}
          />
        </Show>
        <Show when={!props.getArgumentByStep(step()).editable}>
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
          type={props.getArgumentByStep(step()).pro ? 'pro' : 'con'}
          id={props.getArgumentByStep(step()).id}
        />
      </Show>
      <Show when={editingArgument()}>
        <ArgumentForm
          saving={savingEdit()}
          onSubmitArgument={(data) => submitEditArgument(step(), data)}
          initialData={{
            pro: props.getArgumentByStep(step()).pro,
            strength: props.getArgumentByStep(step()).strength,
            text: props.getArgumentByStep(step()).text
          }}
          hasPremise={hasPremise(step())}
        />
      </Show>
      <Show when={props.premiseFormId() === step().statementId}>
        <StatementForm
          saving={props.savingPremise()}
          onSubmitStatement={(data) => submitPremise(step(), data)}
        />
      </Show>
    </>
  )
}
