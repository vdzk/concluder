import { A, useParams } from "@solidjs/router"
import { createSignal, For, onMount, Show, type Component } from "solid-js"
import { rpc } from "./utils"
import { createStore } from "solid-js/store"
import { Statement, StatementDataRow } from "./Statement"
import { Argument } from "./Argument"
import { ScoreChanges } from "../../shared/types"
import { IconButton } from "./Buttons"
import { ArgumentForm } from "./ArgumentForm"

export interface Step {
  index: number
  statementId: number
  argumentIndex?: number
  premiseIndex?: number
  isClaim?: boolean
}

export const Argue: Component = () => {
  const params = useParams()
  const [path, setPath] = createStore<Step[]>([])
  const [statements, setStatements] = createStore<StatementDataRow[]>([])
  const [scoreChanges, setScoreChanges] = createSignal<ScoreChanges>({
    statement: {},
    argument: {}
  })
  const [argumentFormId, setArgumentFormId] = createSignal<number>()
  const [saving, setSaving] = createSignal(false)

  onMount(async () => {
    if (!params.id) return
    const claimId = parseInt(params.id)
    const claim = await rpc('getClaim', { id: claimId })
    setStatements(claimId, claim)
    setPath([{
      index: 0,
      statementId: claimId,
      isClaim: true
    }])
  })

  const onShowArgumentForm = (step: Step) => {
    onHideArguments(step)
    setArgumentFormId(step.statementId)
  }

  const onShowArguments = async (step: Step, argumentId?: number) => {
    setArgumentFormId()
    // Load arguments
    const _arguments = await rpc(
      'getArgumentsByClaimId',
      { claimId: step.statementId }
    )
    setStatements(step.statementId, 'arguments', _arguments)

    // Set argument index
    if (_arguments?.length) {
      let newArgumentIndex = -1
      if (argumentId) {
        newArgumentIndex = _arguments.findIndex((a: any) => a.id === argumentId)
      }
      if (newArgumentIndex === -1 && step.argumentIndex === undefined) {
        newArgumentIndex = 0
      }
      if (newArgumentIndex !== -1) {
        setPath(step.index, 'argumentIndex', newArgumentIndex)
      }
    }
  }

  const onHideArguments = (step: Step) => {
    setPath(prev => prev.slice(0, step.index + 1))
    setPath(step.index, 'argumentIndex', undefined)
  }

  const onShowPremises = async (step: Step) => {
    const claim = statements[step.statementId]
    if (step.argumentIndex === undefined) return
    const argument = claim.arguments![step.argumentIndex]
    let premises = argument.premises
    if (!premises) {
      const premisesData = await rpc(
        'getPremisesByArgumentId',
        { argumentId: argument.id }
      )
      // TODO: research if this can this be done without a loop
      for (const statement of premisesData.statements) {
        setStatements(statement.id, statement)
      }
      setStatements(
        step.statementId, 'arguments', step.argumentIndex,
        'premises', premisesData.premises
      )
      premises = premisesData.premises
    }
    if (premises?.length) {
      setPath(step.index, 'premiseIndex', 0)
      const newStepIndex = step.index + 1
      setPath(newStepIndex, {
        index: newStepIndex,
        statementId: premises[0].statement_id
      })
    }
  }

  const onHidePremises = (step: Step) => {
    setPath(prev => prev.slice(0, step.index + 1))
  }

  const onShiftPremise = (step: Step, premiseIndexDelta: number) => {
    const newPremiseIndex = step.premiseIndex! + premiseIndexDelta
    setPath(step.index, 'premiseIndex', newPremiseIndex)
    const nextStatementId = statements[step.statementId]
      .arguments![step.argumentIndex!]
      .premises![newPremiseIndex]
      .statement_id
    const newStepIndex = step.index + 1
    setPath(newStepIndex, {
      index: newStepIndex,
      statementId: nextStatementId
    })
  }

  const onShiftArgument = (step: Step, argumentIndexDelta: number) => {
    const newArgumentIndex = step.argumentIndex! + argumentIndexDelta
    setPath(prevPath => [ ...prevPath.slice(0, step.index), {
        ...step,
        argumentIndex: newArgumentIndex,
        premiseIndex: undefined
    }])
  }

  const submitArgument = async (step: Step, text: string) => {
    setSaving(true)
    const data = await rpc('addArgument', {
      claim_id: step.statementId,
      text
    })
    await onShowArguments(step, data.savedId)
    setScoreChanges(data.scoreChanges)
    setArgumentFormId()
    setSaving(false)
  }


  const getArgumentByStep = (step: Step) => statements[step.statementId]
    .arguments![step.argumentIndex!]

  return (
    <main>
      <div class="max-w-lg mx-auto pb-16">
        <div class="flex justify-center">
          {/* TODO: refactor this hack */}
          <A href="/">
            <IconButton
              iconName="home"
              onClick={() => {}}
              label="all claims"
            />
          </A>
        </div>
        <For each={path}>
          {(step, index) => (
            <>
              <Statement
                {...{ step, onShowArguments, setScoreChanges }}
                statement={statements[step.statementId]}
                scoreChange={scoreChanges().statement[step.statementId]}
                parentPremiseIndex={index() > 0 ? path[index() - 1].premiseIndex : undefined}
              />
              <div class="flex select-none">
                <div class="w-[calc(50%-18px)]" />
                <Show when={
                  step.argumentIndex === undefined &&
                  statements[step.statementId].hasArgument
                }>
                  <IconButton
                    label="show arguments"
                    iconName="chevron-down"
                    onClick={() => onShowArguments(step)}
                  />
                </Show>
                <Show when={step.argumentIndex !== undefined}>
                  <IconButton
                    label="hide arguments"
                    iconName="chevron-up"
                    onClick={() => onHideArguments(step)}
                  />
                </Show>
                <Show when={
                  step.argumentIndex !== undefined &&
                  (statements[step.statementId].arguments?.length ?? 0) > 1
                }>
                  <IconButton
                    iconName="arrow-left"
                    onClick={() => onShiftArgument(step, -1)}
                    disabled={step.argumentIndex === 0}
                  />
                  <IconButton
                    iconName="arrow-right"
                    onClick={() => onShiftArgument(step, 1)}
                    disabled={step.argumentIndex! === (statements[step.statementId].arguments?.length ?? 0) - 1 }
                  />
                </Show>
                <Show when={argumentFormId() !== step.statementId}>
                  <IconButton
                    label="add argument"
                    iconName="plus"
                    onClick={() => onShowArgumentForm(step)}
                  />
                </Show>
                <Show when={argumentFormId() === step.statementId}>
                  <IconButton
                    label="cancel"
                    iconName="minus"
                    onClick={() => setArgumentFormId()}
                  />
                </Show>
              </div>
              <Show when={argumentFormId() === step.statementId}>
                <ArgumentForm
                  saving={saving()}
                  onSubmitArgument={(text) => submitArgument(step, text)}
                />
              </Show>
              <Show when={step.argumentIndex !== undefined}>
                <Argument
                  {...{ step, onShowPremises, onShiftPremise }}
                  argument={getArgumentByStep(step)}
                  scoreChange={scoreChanges().argument[getArgumentByStep(step).id]}
                />
                <div class="flex select-none">
                  <div class="w-[calc(50%-18px)]" />
                  <Show when={index() === path.length - 1}>
                    <IconButton
                      label="show premises"
                      iconName="chevron-down"
                      onClick={() => onShowPremises(step)}
                    />
                  </Show>
                  <Show when={index() < path.length - 1}>
                    <IconButton
                      label="hide premises"
                      iconName="chevron-up"
                      onClick={() => onHidePremises(step)}
                    />
                  </Show>
                  <Show when={
                    index() + 1 < path.length &&
                    (statements[step.statementId].arguments![step.argumentIndex!].premises?.length ?? 0) > 1
                  }>
                    <IconButton
                      iconName="arrow-left"
                      onClick={() => onShiftPremise(step, -1)}
                      disabled={step.premiseIndex === 0}
                    />
                    <IconButton
                      iconName="arrow-right"
                      onClick={() => onShiftPremise(step, 1)}
                      disabled={step.premiseIndex === (statements[step.statementId].arguments![step.argumentIndex!].premises?.length ?? 0) - 1}
                    />
                  </Show>
                </div>
              </Show>
            </>
          )}
        </For>
      </div>
    </main>
  )
}