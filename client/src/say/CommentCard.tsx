import { Component } from "solid-js"
import { Card } from "./Card"
import { CardProps } from "./cardTypes"

export const CommentCard: Component<CardProps> = (props) => {
  const c = () => props.commentsById[props.id]
  return (
    <Card
      topBar={<span class="font-semibold text-gray-700">Comment</span>}
      text={c()?.text ?? ''}
    />
  )
}