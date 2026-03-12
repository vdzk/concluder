import { Component, createSignal, JSXElement } from "solid-js"
import { ArgumentRecord, MoveRecord, StatementRecord } from "../../../shared/types"
import { Dynamic } from "solid-js/web"
import { EditArgumentStage } from "./EditArgumentStage"
import { DirectionStage } from "./DirectionStage"
import { ArgumentFocusStage, ArgumentFocusArea } from "./ArgumentFocusStage"
import { HiddenPremiseStage } from "./HiddenPremiseStage"
import { LinkToConclusionStage } from "./LinkToConclusionStage"
import { ExplicitPremiseStage } from "./ExplicitPremiseStage"

const StartStage: Component = () => {
  return (
    <div class="px-2 py-1 text-lg">
      👉 Start by selecting a <span class="font-bold">"Response"</span> that you want to respond to.
    </div>
  )
}

const argumentFocusAreaStages: Record<ArgumentFocusArea, Component<any>> = {
  explicitPremise: ExplicitPremiseStage,
  linkToConclusion: LinkToConclusionStage,
  hiddenPremise: HiddenPremiseStage
}

export const MoveForm: Component<{
  moveIndex?: number
  moves: MoveRecord[]
  statementsById: Record<number, StatementRecord>
  argumentsById: Record<number, ArgumentRecord>
  clearForm: () => void
  reloadTable: () => Promise<void>
  mainClaimId: number
}> = props => {
  const [pro, setPro] = createSignal<boolean>()
  const [argumentFocusArea, setArgumentFocusArea]
    = createSignal<ArgumentFocusArea>()

  const getStage = (): Component<any> => {
    if (props.moveIndex === undefined) {
      return StartStage
    } else if (pro() === undefined) {
      return DirectionStage
    } else {
      const targetMove = props.moves[props.moveIndex]
      if (targetMove.type === 'addArgument') {
        const focusArea = argumentFocusArea()
        if (focusArea === undefined) {
          return ArgumentFocusStage
        } else {
          return argumentFocusAreaStages[focusArea]
        }
      } else {
        // addClaim and addPremiseArgument: target is statement_id
        return EditArgumentStage
      }
    }
  }

  const targetData = () => {
    if (props.moveIndex === undefined) return {}
    const targetMove = props.moves[props.moveIndex]
    const statement = targetMove.statement_id
      ? props.statementsById[targetMove.statement_id]
      : undefined
    const argument = targetMove.argument_id && targetMove.type !== 'addPremiseArgument'
      ? props.argumentsById[targetMove.argument_id]
      : undefined

    let targetEntry: JSXElement
    let targetText = ''
    if (argument) {
      targetText = argument.text
      targetEntry = (
        <>
          <div class="font-bold py-1 px-2">
            Target Argument:
          </div>
          <div class="px-2 pb-2 text-lg">
            <div class="border rounded w-fit max-w-2xl px-2 py-1">
              <div>
                {props.statementsById[argument.claim_id].text}
              </div>
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
    } else if (statement) {
      targetText = statement.text
      targetEntry = (
        <div class="px-2 py-1 text-lg">
          {statement.text}
        </div>
      )
    }

    return { targetEntry, targetText, targetMove }
  }

  return (
    <div class="bg-white border-t">
      <Dynamic
        component={getStage()}
        pro={pro()}
        clearForm={props.clearForm}
        reloadTable={props.reloadTable}
        mainClaimId={props.mainClaimId}
        {...{
          setPro, setArgumentFocusArea
        }}
        {...targetData()}
      />
    </div>
  )
}