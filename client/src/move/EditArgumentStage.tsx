import { Component, JSXElement} from "solid-js"
import { rpc } from "../utils"
import { MoveRecord } from "../../../shared/types"
import { EditArgumentForm } from "./EditArgumentForm"

export const EditArgumentStage: Component<{
  pro: boolean
  setPro: (pro?: boolean) => void
  clearForm: () => void
  targetMove: MoveRecord
  mainClaimId: number
  targetEntry: JSXElement
  reloadTable: () => Promise<void>
}> = props => {
  const onSubmit = async (text: string, pro: boolean, strength: number) => {
    const argument = {
      claim_id: props.targetMove.statement_id,
      text, pro, strength
    }
    const move = {
      claim_id: props.mainClaimId,
      type: 'addArgument',
      target_id: props.targetMove.id
    }
    await rpc('addArgumentMove', { argument, move })
    props.clearForm()
    await props.reloadTable()
  }

  return (
    <EditArgumentForm
      pro={props.pro}
      targetEntry={props.targetEntry}
      onSubmit={onSubmit}
      onBack={() => props.setPro()}
      onCancel={props.clearForm}
    />
  )
}
