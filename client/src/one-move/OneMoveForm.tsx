import { Component, createSignal, For, JSXElement, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { Dynamic } from "solid-js/web"
import { GetMoveResponse, MoveRecord } from "../../../shared/types"
import { etv, rpc } from "../utils"
import { DirectionStage } from "../move/DirectionStage"
import { ArgumentFocusStage, ArgumentFocusArea } from "../move/ArgumentFocusStage"
import { EditArgumentForm } from "../move/EditArgumentForm"
import { HiddenPremiseStage } from "../move/HiddenPremiseStage"
import { LinkToConclusionStage } from "../move/LinkToConclusionStage"
import { TextButton } from "../Buttons"

export type BadgeTarget = 'claim' | 'argument' | 'targetStatement'

export const OneMoveForm: Component<{
  data: GetMoveResponse
  badgeTarget: BadgeTarget
  onCancel: () => void
}> = props => {
  const navigate = useNavigate()
  const [pro, setPro] = createSignal<boolean>()
  const [argumentFocusArea, setArgumentFocusArea] = createSignal<ArgumentFocusArea>()

  const { move, claimStatement, statement, argument, targetArgumentClaim } = props.data
  const mainClaimId = move.claim_id
  const effectiveStatement = statement ?? props.data.targetStatement

  // Build targetMove, targetEntry, targetText based on which badge was clicked
  let targetMove: MoveRecord
  let targetEntry: JSXElement
  let targetText = ''

  if (props.badgeTarget === 'argument' && argument) {
    // Responding to the argument → ArgumentFocusStage path
    targetText = argument.text
    const claimText = targetArgumentClaim?.text ?? claimStatement.text
    targetMove = {
      id: move.id,
      claim_id: move.claim_id,
      type: 'addArgument',
      statement_id: move.statement_id ?? effectiveStatement?.id ?? null,
      argument_id: move.argument_id,
      target_id: move.target_id,
      avatar_id: 0
    }
    targetEntry = (
      <>
        <div class="font-bold py-1 px-2">Target Argument:</div>
        <div class="px-2 pb-2 text-lg">
          <div class="border rounded w-fit max-w-2xl px-2 py-1">
            <div>{claimText}</div>
            <div class="font-bold">
              <span classList={{
                'text-green-700': argument.pro,
                'text-red-700': !argument.pro
              }}>
                {argument.pro ? 'is true because...' : 'is false because...'}
              </span>
            </div>
            <div>{argument.text}</div>
          </div>
        </div>
      </>
    )
  } else if (props.badgeTarget === 'targetStatement' && props.data.targetStatement) {
    // Responding to the target statement → EditArgumentStage path
    const ts = props.data.targetStatement
    targetText = ts.text
    targetMove = {
      id: move.id,
      claim_id: move.claim_id,
      type: 'addPremiseArgument',
      statement_id: ts.id,
      argument_id: move.argument_id,
      target_id: move.target_id,
      avatar_id: 0
    }
    targetEntry = (
      <div class="px-2 py-1 text-lg">{ts.text}</div>
    )
  } else {
    // Responding to the main claim → EditArgumentStage path
    targetText = claimStatement.text
    targetMove = {
      id: move.id,
      claim_id: move.claim_id,
      type: 'addClaim',
      statement_id: claimStatement.id,
      argument_id: null,
      target_id: move.target_id,
      avatar_id: 0
    }
    targetEntry = (
      <div class="px-2 py-1 text-lg">{claimStatement.text}</div>
    )
  }

  const navigateToNewMove = (savedId: number) => {
    navigate(`/one-move/${savedId}`)
  }

  // Inline EditArgumentStage: submits addArgumentMove then navigates
  const OneMoveEditArgumentStage: Component<{
    pro: boolean
    setPro: (pro?: boolean) => void
    clearForm: () => void
    targetMove: MoveRecord
    mainClaimId: number
    targetEntry: JSXElement
  }> = stageProps => {
    const onSubmit = async (text: string, pro: boolean, strength: number) => {
      const result = await rpc('addArgumentMove', {
        argument: { claim_id: stageProps.targetMove.statement_id, text, pro, strength },
        move: { claim_id: stageProps.mainClaimId, type: 'addArgument', target_id: stageProps.targetMove.id }
      })
      navigateToNewMove(result.savedId)
    }
    return (
      <EditArgumentForm
        pro={stageProps.pro}
        targetEntry={stageProps.targetEntry}
        onSubmit={onSubmit}
        onBack={() => stageProps.setPro()}
        onCancel={stageProps.clearForm}
      />
    )
  }

  // Inline ExplicitPremiseStage: submits addPremiseArgumentMove then navigates
  const OneMoveExplicitPremiseStage: Component<{
    clearForm: () => void
    pro: boolean
    setArgumentFocusArea: () => void
    targetText: string
    mainClaimId: number
    targetMove: MoveRecord
  }> = stageProps => {
    const [multiPremise, setMultiPremise] = createSignal(false)
    const [scopeSelected, setScopeSelected] = createSignal(false)
    const [premiseTextInput, setPremiseTextInput] = createSignal(stageProps.targetText)

    const onSubmit = async (text: string, pro: boolean, strength: number) => {
      const result = await rpc('addPremiseArgumentMove', {
        targetArgumentId: stageProps.targetMove.argument_id,
        argument: { text, pro, strength },
        move: { claim_id: stageProps.mainClaimId, target_id: stageProps.targetMove.id }
      })
      navigateToNewMove(result.savedId)
    }

    const onNext = () => {
      if (!scopeSelected()) {
        setScopeSelected(true)
      }
    }

    const onBack = () => {
      if (scopeSelected()) setScopeSelected(false)
      else stageProps.setArgumentFocusArea()
    }

    const premiseTargetEntry = () => (
      <div class="px-2 py-1 text-lg">{stageProps.targetText}</div>
    )

    const bottomButtons = (
      <div class="flex gap-2 px-2 pb-2 pt-1">
        <TextButton label="Next" color="green" onClick={onNext} />
        <TextButton label="Back" color="gray" onClick={onBack} />
        <TextButton label="Cancel" color="gray" onClick={stageProps.clearForm} />
      </div>
    )

    return (
      <>
        <Show when={scopeSelected() && multiPremise()}>
          {premiseTargetEntry()}
          <div class="font-bold px-2">
            Please keep the part that you would like to{' '}
            <span class="font-bold" classList={{
              'text-green-700 dark:text-green-400': stageProps.pro,
              'text-red-700 dark:text-red-400': !stageProps.pro
            }}>
              {stageProps.pro ? 'support' : 'oppose'}
            </span>
            {' '}and remove the rest.
          </div>
          <div class="px-2 pb-2 max-w-2xl">
            <textarea
              rows={3}
              placeholder="Type here..."
              class="border rounded px-1.5 py-0.5 focus:outline-none block w-full"
              onChange={etv(setPremiseTextInput)}
              value={premiseTextInput()}
            />
          </div>
          {bottomButtons}
        </Show>
        <Show when={scopeSelected() && !multiPremise()}>
          <EditArgumentForm
            pro={stageProps.pro}
            targetEntry={premiseTargetEntry()}
            onSubmit={onSubmit}
            onBack={() => setScopeSelected(false)}
            onCancel={stageProps.clearForm}
          />
        </Show>
        <Show when={!scopeSelected()}>
          {premiseTargetEntry()}
          <div class="font-bold px-2">
            Which part of this would you like to{' '}
            <span class="font-bold" classList={{
              'text-green-700 dark:text-green-400': stageProps.pro,
              'text-red-700 dark:text-red-400': !stageProps.pro
            }}>
              {stageProps.pro ? 'support' : 'oppose'}
            </span>
            ?
          </div>
          <For each={[true, false]}>
            {all => (
              <div class="px-2">
                <input class="cursor-pointer" type="radio" name="focusArea"
                  id={all ? 'all' : 'some'} value={all ? 'all' : 'some'}
                  checked={all === !multiPremise()}
                  onChange={etv(val => setMultiPremise(val === 'some'))} />
                <label for={all ? 'all' : 'some'} class="pl-1 cursor-pointer">
                  {all ? 'All of it' : 'Some of it'}
                </label>
              </div>
            )}
          </For>
          {bottomButtons}
        </Show>
      </>
    )
  }

  const argumentFocusAreaStages: Record<ArgumentFocusArea, Component<any>> = {
    explicitPremise: OneMoveExplicitPremiseStage,
    linkToConclusion: LinkToConclusionStage,
    hiddenPremise: HiddenPremiseStage
  }

  const getStage = (): Component<any> => {
    if (pro() === undefined) return DirectionStage
    if (targetMove.type === 'addArgument') {
      const focusArea = argumentFocusArea()
      if (focusArea === undefined) return ArgumentFocusStage
      return argumentFocusAreaStages[focusArea]
    }
    return OneMoveEditArgumentStage
  }

  return (
    <main class="max-w-2xl mx-auto mt-4">
      <div class="bg-white rounded-xl">
        <Dynamic
          component={getStage()}
          pro={pro()}
          clearForm={props.onCancel}
          mainClaimId={mainClaimId}
          targetEntry={targetEntry}
          targetText={targetText}
          targetMove={targetMove}
          {...{ setPro, setArgumentFocusArea }}
        />
      </div>
    </main>
  )
}
