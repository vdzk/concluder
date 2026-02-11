import { A, useParams } from "@solidjs/router"
import { createSignal, For, onMount, Show, type Component } from "solid-js"
import { rpc } from "./utils"
import { createStore } from "solid-js/store"
import { Statement, StatementDataRow } from "./Statement"
import { Argument } from "./Argument"
import { ScoreChanges } from "../../shared/types"

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

  const onShowArguments = async (step: Step, argumentId?: number) => {
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

  const getArgumentByStep = (step: Step) => statements[step.statementId]
    .arguments![step.argumentIndex!]

  return (
    <main>
      <div class="max-w-lg mx-auto pt-2">
        <div class="">
          <A
            href="/"
            class="text-sky-700 hover:underline"
          >{'<'} All claims</A>
        </div>
        <For each={path}>
          {step => (
            <>
              <Statement
                {...{ step, onShowArguments, setScoreChanges }}
                statement={statements[step.statementId]}
                scoreChange={scoreChanges().statement[step.statementId]}
              />
              <Show when={step.argumentIndex !== undefined}>
                <Argument
                  {...{ step, onShowPremises, onShiftPremise }}
                  argument={getArgumentByStep(step)}
                  scoreChange={scoreChanges().argument[getArgumentByStep(step).id]}
                />
              </Show>
            </>
          )}
        </For>
      </div>
    </main>
  )
}