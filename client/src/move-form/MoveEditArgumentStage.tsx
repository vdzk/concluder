import { Component, JSXElement } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { MoveRecord } from "../../../shared/types"
import { rpc } from "../utils"
import { EditArgumentForm } from "./EditArgumentForm"

export type Props = {
  pro: boolean
  setPro: (pro?: boolean) => void
  clearForm: () => void
  targetMove: MoveRecord
  mainClaimId: number
  targetStatementId: number | null
  targetEntry: JSXElement
}

export const MoveEditArgumentStage: Component<Props> = props => {
  const navigate = useNavigate()

  const onSubmit = async (text: string, pro: boolean, strength: number) => {
    const result = await rpc('addArgumentMove', {
      argument: { claim_id: props.targetStatementId, text, pro, strength },
      move: { claim_id: props.mainClaimId, type: 'addArgument' }
    })
    navigate(`/move/${result.savedId}`)
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
