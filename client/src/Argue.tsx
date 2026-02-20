import { A, useNavigate, useParams } from "@solidjs/router"
import { createEffect, createSignal, For, onMount, Show, type Component } from "solid-js"
import { rpc } from "./utils"
import { createStore, produce } from "solid-js/store"
import { Statement, StatementDataRow } from "./Statement"
import { Argument } from "./Argument"
import { ArgumentFormData, PremiseFormData, ScoreChanges } from "../../shared/types"
import { IconButton } from "./Buttons"
import { ArgumentForm } from "./ArgumentForm"
import { PremiseForm } from "./PremiseForm"
import { tabs } from "./Home"
import { countries } from '../../shared/constants'

export interface Step {
  index: number
  statementId: number
  argumentIndex?: number
  premiseIndex?: number
  isClaim?: boolean
}

type ScoreDeltas = Record<'statement' | 'argument', Record<number, number>>

interface ArgumentLocation {
  statementId: number,
  argumentIndex: number
}

export const Argue: Component = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [path, setPath] = createStore<Step[]>([])
  const [statements, setStatements] = createStore<Record<number, StatementDataRow>>({})
  const [argumentLocations, setArgumentLocations] = createStore<Record<number, ArgumentLocation>>({})
  const [scoreDeltas, setScoreDeltas] = createSignal<ScoreDeltas>({
    statement: {},
    argument: {}
  })
  const [argumentFormId, setArgumentFormId] = createSignal<number>()
  const [savingArgument, setSavingArgument] = createSignal(false)
  const [premiseFormId, setPremiseFormId] = createSignal<number>()
  const [savingPremise, setSavingPremise] = createSignal(false)
  const [tag, setTag] = createSignal('')
  const [countryCode, setCountryCode] = createSignal('')

  onMount(async () => {
    if (!params.id) return
    const claimId = parseInt(params.id)
    const claim = await rpc('getClaim', { id: claimId })
    setTag(claim.tag)
    setCountryCode(claim.country_code)
    setStatements(claimId, claim)
    document.title = claim.text
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

  const onShowPremiseForm = (step: Step) => {
    onHidePremises(step)
    setPremiseFormId(step.statementId)
  }

  const onShowArguments = async (step: Step, argumentId?: number) => {
    setArgumentFormId()
    // Load arguments
    const { statementId } = step
    const _arguments = await rpc(
      'getArgumentsByClaimId',
      { claimId: statementId }
    )
    setStatements(step.statementId, 'arguments', _arguments)
    for (let argumentIndex = 0; argumentIndex < _arguments.length; argumentIndex++) {
      setArgumentLocations(_arguments[argumentIndex].id, {
        statementId,
        argumentIndex
      })
    }

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
    } else {
      setStatements(step.statementId, 'hasArgument', false)
    }
  }

  const onHideArguments = (step: Step) => {
    setPath(prev => [
      ...prev.slice(0, step.index), {
        ...step,
        argumentIndex: undefined,
        premiseIndex: undefined
      }
    ])
  }

  const onShowPremises = async (step: Step, premiseId?: number, reload?: boolean) => {
    const claim = statements[step.statementId]
    if (step.argumentIndex === undefined) return
    const argument = claim.arguments![step.argumentIndex]
    let premises = argument.premises
    if (!premises || reload) {
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
      let newPremiseIndex = -1
      if (premiseId) {
        newPremiseIndex = premises.findIndex(p => p.id === premiseId)
      }
      if (newPremiseIndex === -1 && step.premiseIndex === undefined) {
        newPremiseIndex = 0
      }
      if (newPremiseIndex !== -1) {
        setPath(step.index, 'premiseIndex', newPremiseIndex)
        const newStepIndex = step.index + 1
        setPath(newStepIndex, {
          index: newStepIndex,
          statementId: premises[newPremiseIndex].statement_id
        })
      }
    }
  }

  const onHidePremises = (step: Step) => {
    setPath(prev => prev.slice(0, step.index + 1))
    setPath(step.index, 'premiseIndex', undefined)
  }

  const onShiftPremise = (step: Step, premiseIndexDelta: number) => {
    const newPremiseIndex = step.premiseIndex! + premiseIndexDelta
    setPath(step.index, 'premiseIndex', newPremiseIndex)
    const nextStatementId = statements[step.statementId]
      .arguments![step.argumentIndex!]
      .premises![newPremiseIndex]
      .statement_id
    const newStepIndex = step.index + 1
    setPath(prev => [
      ...prev.slice(0, newStepIndex), {
        index: newStepIndex,
        statementId: nextStatementId
      }
    ])
  }

  const onShiftArgument = (step: Step, argumentIndexDelta: number) => {
    const newArgumentIndex = step.argumentIndex! + argumentIndexDelta
    setPath(prevPath => [...prevPath.slice(0, step.index), {
      ...step,
      argumentIndex: newArgumentIndex,
      premiseIndex: undefined
    }])
  }

  const onDeleteStatement = async (step: Step) => {
    if (confirm(`Delete the ${step.isClaim ? 'claim' : 'premise'} above?`)) {
      const data = await rpc('deleteStatement', { id: step.statementId })
      if (step.isClaim) {
        navigate(`/tab/${tag()}`)
      } else {
        const prevStep = path[step.index - 1]
        setStatements(prevStep.statementId, 'arguments', prevStep.argumentIndex!,
          (produce(prevArgument => {
            prevArgument.premises!.splice(prevStep.premiseIndex!, 1)
            if (prevArgument.premises!.length === 0) {
              prevArgument.hasPremise = false
            }
          }))
        )
        shiftScores(data.scoreChanges)
        setPath(prevPath => prevPath.slice(0, step.index))
        setPath(step.index - 1, 'premiseIndex', undefined)
      }
    }
  }

  const onDeleteArgument = async (step: Step) => {
    if (confirm(`Delete the argument above?`)) {
      const argument = getArgumentByStep(step)
      const data = await rpc('deleteArgument', { id: argument.id })
      shiftScores(data.scoreChanges)
      const newPath = [
        ...path.slice(0, step.index),
        { ...step, argumentIndex: undefined, premiseIndex: undefined }
      ]
      setPath(newPath)
    }
  }

  const shiftScores = (scoreChanges: ScoreChanges) => {
    const newScoreDeltas: Record<'statement' | 'argument', Record<number, number>> = {
      statement: {},
      argument: {}
    }
    for (const entryType of ['statement', 'argument'] as const) {
      for (const _entryId in scoreChanges[entryType]) {
        const entryId = parseInt(_entryId)
        const score = scoreChanges[entryType][entryId]
        const delta = score.new - score.old
        newScoreDeltas[entryType][entryId] = delta
        if (entryType === 'statement') {
          setStatements(entryId, 'likelihood', score.new)
        } else {
          if (entryId in argumentLocations) {
            const { statementId, argumentIndex } = argumentLocations[entryId]
            setStatements(statementId, 'arguments', argumentIndex, 'strength', score.new)
          }
        }
      }
    }
    setScoreDeltas(newScoreDeltas)
  }

  const submitArgument = async (step: Step, argumentFormData: ArgumentFormData) => {
    setSavingArgument(true)
    const data = await rpc('addArgument', {
      claim_id: step.statementId,
      ...argumentFormData
    })
    await onShowArguments(step, data.savedId)
    setStatements(step.statementId, 'hasArgument', true)
    shiftScores(data.scoreChanges)
    setArgumentFormId()
    setSavingArgument(false)
  }

  const submitPremise = async (step: Step, premiseFormData: PremiseFormData) => {
    setSavingPremise(true)
    const argumentId = statements[step.statementId].arguments![step.argumentIndex!].id
    const data = await rpc('addPremise', {
      argument_id: argumentId,
      ...premiseFormData
    })
    setPremiseFormId()
    setSavingPremise(false)
    setStatements(step.statementId, 'arguments', step.argumentIndex!, 'hasPremise', true)
    await onShowPremises(step, data.savedId, true)
    shiftScores(data.scoreChanges)
  }


  const getArgumentByStep = (step: Step) => statements[step.statementId]
    .arguments![step.argumentIndex!]
  const getSideIndexByStep = (step: Step) => {
    const pro = getArgumentByStep(step).pro
    return statements[step.statementId].arguments!.slice(0, step.argumentIndex!)
      .filter(a => a.pro === pro).length
  }
  const getNumPremises = (step: Step) => (statements[step.statementId].arguments![step.argumentIndex!].premises?.length ?? 0)
  const hasPremise = (step: Step) => (statements[step.statementId].arguments![step.argumentIndex!].hasPremise)

  return (
    <main>
      <div class="max-w-lg mx-auto pb-16">
        <div class="flex justify-center">
          {/* TODO: refactor this hack */}
          <A
            href={`/tab/${tag()}${countryCode() ? '/' + countryCode() : ''}`}
            class="font-bold hover:bg-orange-200 px-2 py-1"
          >
            {tabs[tag()]?.label}
            <Show when={countryCode()}>
              {' - '}
              {countries[countryCode()]}
            </Show>
          </A>
        </div>
        <For each={path}>
          {(step, index) => (
            <>
              <Statement
                {...{ step, onShowArguments }}
                statement={statements[step.statementId]}
                scoreDelta={scoreDeltas().statement[step.statementId]}
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
                    label="prev. argument"
                  />
                  <IconButton
                    iconName="arrow-right"
                    onClick={() => onShiftArgument(step, 1)}
                    disabled={step.argumentIndex! === (statements[step.statementId].arguments?.length ?? 0) - 1}
                    label="next argument"
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
                <Show when={statements[step.statementId].editable}>
                  <IconButton
                    label="delete"
                    iconName="delete"
                    onClick={() => onDeleteStatement(step)}
                  />
                </Show>
              </div>
              <Show when={argumentFormId() === step.statementId}>
                <ArgumentForm
                  saving={savingArgument()}
                  onSubmitArgument={(data) => submitArgument(step, data)}
                />
              </Show>
              <Show when={step.argumentIndex !== undefined}>
                <Argument
                  {...{ step, onShowPremises, onShiftPremise }}
                  argument={getArgumentByStep(step)}
                  scoreDelta={scoreDeltas().argument[getArgumentByStep(step).id]}
                  sideIndex={getSideIndexByStep(step)}
                />
                <div class="flex select-none">
                  <div class="w-[calc(50%-18px)]" />
                  <Show when={hasPremise(step)}>
                    <Show when={step.premiseIndex === undefined}>
                      <IconButton
                        label="show premises"
                        iconName="chevron-down"
                        onClick={() => onShowPremises(step)}
                      />
                    </Show>
                    <Show when={step.premiseIndex !== undefined}>
                      <IconButton
                        label="hide premises"
                        iconName="chevron-up"
                        onClick={() => onHidePremises(step)}
                      />
                    </Show>
                  </Show>
                  <Show when={
                    index() + 1 < path.length &&
                    getNumPremises(step) > 1
                  }>
                    <IconButton
                      iconName="arrow-left"
                      onClick={() => onShiftPremise(step, -1)}
                      disabled={step.premiseIndex === 0}
                      label="prev. premise"
                    />
                    <IconButton
                      iconName="arrow-right"
                      onClick={() => onShiftPremise(step, 1)}
                      disabled={step.premiseIndex === getNumPremises(step) - 1}
                      label="next premise"
                    />
                  </Show>
                  <Show when={premiseFormId() !== step.statementId}>
                    <IconButton
                      label="add premise"
                      iconName="plus"
                      onClick={() => onShowPremiseForm(step)}
                    />
                  </Show>
                  <Show when={premiseFormId() === step.statementId}>
                    <IconButton
                      label="cancel"
                      iconName="minus"
                      onClick={() => setPremiseFormId()}
                    />
                  </Show>
                  <Show when={getArgumentByStep(step).editable}>
                    <IconButton
                      label="delete"
                      iconName="delete"
                      onClick={() => onDeleteArgument(step)}
                    />
                  </Show>
                </div>
                <Show when={premiseFormId() === step.statementId}>
                  <PremiseForm
                    saving={savingPremise()}
                    onSubmitPremise={(data) => submitPremise(step, data)}
                  />
                </Show>
              </Show>
            </>
          )}
        </For>
      </div>
    </main>
  )
}