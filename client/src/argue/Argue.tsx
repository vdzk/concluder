import { useNavigate, useParams } from "@solidjs/router"
import { createSignal, For, onMount, Show, type Component } from "solid-js"
import { createStore } from "solid-js/store"
import { rpc } from "../utils"
import { Argument } from "./Argument"
import { StatementControls } from "./StatementControls"
import { ArgumentControls } from "./ArgumentControls"
import { ClaimHeader } from "./ClaimHeader"
import { ScoreChanges } from "../../../shared/types"
import type { Step, ScoreDeltas, ArgumentLocation } from "./types"
import { Statement, StatementDataRow } from "./Statement"

export type { Step } from "./types"

export const Argue: Component = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [tag, setTag] = createSignal('')
  const [countryCode, setCountryCode] = createSignal('')

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

  const getArgumentByStep = (step: Step) =>
    statements[step.statementId].arguments![step.argumentIndex!]

  const getSideIndexByStep = (step: Step) => {
    const pro = getArgumentByStep(step).pro
    return statements[step.statementId].arguments!.slice(0, step.argumentIndex!)
      .filter(a => a.pro === pro).length
  }

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

  return (
    <main>
      <div class="max-w-lg mx-auto pb-16">
        <ClaimHeader tag={tag} countryCode={countryCode} />
        <For each={path}>
          {(step, index) => (
            <>
              <Statement
                step={step}
                statement={statements[step.statementId]}
                scoreDelta={scoreDeltas().statement[step.statementId]}
                parentPremiseIndex={index() > 0 ? path[index() - 1].premiseIndex : undefined}
              />
              <StatementControls
                step={step}
                onClaimDeleted={() => navigate(`/tab/${tag()}`)}
                {...{
                  statements, setStatements,
                  setArgumentLocations,
                  path, setPath,
                  argumentFormId, setArgumentFormId,
                  savingArgument, setSavingArgument,
                  shiftScores,
                }}
              />
              <Show when={step.argumentIndex !== undefined}>
                <Argument
                  argument={getArgumentByStep(step)}
                  scoreDelta={scoreDeltas().argument[getArgumentByStep(step).id]}
                  sideIndex={getSideIndexByStep(step)}
                />
                <ArgumentControls
                  step={step}
                  stepIndex={index}
                  {...{
                    statements, setStatements,
                    path, setPath,
                    premiseFormId, setPremiseFormId,
                    savingPremise, setSavingPremise,
                    shiftScores,
                    getArgumentByStep,
                  }}
                />
              </Show>
            </>
          )}
        </For>
      </div>
    </main>
  )
}