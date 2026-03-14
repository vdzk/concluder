import { Component, JSXElement } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { MoveRecord } from "../../../shared/types"
import { rpc } from "../utils"
import { EditArgumentForm } from "./EditArgumentForm"
import { Card } from "../move/Card"
import type { ArgumentFocusArea } from "./ArgumentFocusStage"

export type Props = {
  clearForm: () => void
  pro: boolean
  setArgumentFocusArea: (area?: ArgumentFocusArea) => void
  targetText: string
  conclusionText: string
  mainClaimId: number
  targetMove: MoveRecord
}

export const LinkToConclusionStage: Component<Props> = props => {
  const navigate = useNavigate()
  const premiseText = `If "${props.targetText}" then "${props.conclusionText}".`

  const premiseTargetEntry = () => (
    <Card><div class="text-lg">{premiseText}</div></Card>
  )

  const onSubmit = async (text: string, pro: boolean, strength: number) => {
    const result = await rpc('addPremiseArgumentMove', {
      targetArgumentId: props.targetMove.argument_id,
      premiseText,
      argument: { text, pro, strength },
      move: { claim_id: props.mainClaimId, target_id: props.targetMove.id }
    })
    navigate(`/move/${result.savedId}`)
  }

  return (
    <EditArgumentForm
      pro={props.pro}
      targetEntry={premiseTargetEntry()}
      onSubmit={onSubmit}
      onBack={() => props.setArgumentFocusArea()}
      onCancel={props.clearForm}
    />
  )
}