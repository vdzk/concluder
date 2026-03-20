import { batch, Component, createMemo, For, onMount, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { createStore } from "solid-js/store"
import { rpc } from "../utils"
import { useParams } from "@solidjs/router"
import { StatementCard } from "./StatementCard"
import { ArgumentCard } from "./ArgumentCard"
import { CommentCard } from "./CommentCard"
import { CardProps, Statement, Argument, Comment, EdgeType } from "./cardTypes"
import { TextButton, TextButtonLink } from "../Buttons"

type PathEntry =
  | { kind: 'statement', id: number }
  | { kind: 'argument', id: number }
  | { kind: 'comment', id: number }

const cardComponents: Record<PathEntry['kind'], Component<CardProps>> = {
  statement: StatementCard,
  argument: ArgumentCard,
  comment: CommentCard,
}



export const SayClaim: Component = () => {
  const params = useParams()
  const mainClaimId = parseInt(params.id!)
  const [statementsById, setStatementsById]
    = createStore<Record<number, Statement>>({})
  const [argumentsById, setArgumentsById]
    = createStore<Record<number, Argument>>({})
  const [commentsById, setCommentsById]
    = createStore<Record<number, Comment>>({})
  const [edges, setEdges]
    = createStore<Record<EdgeType, Record<number, number[]>>>({
      hasArgument: {},
      hasPremise: {},
      statementHasComment: {},
      argumentHasComment: {},
    })
  const [openChild, setOpenChild] = createStore<Record<string, string | undefined>>({})

  const toggleChild = (nodeKey: string, edgeKey: string) => {
    setOpenChild(nodeKey, openChild[nodeKey] === edgeKey ? undefined : edgeKey)
  }

  const buildPath = createMemo((): string[] => {
    const path: string[] = [`statement:${mainClaimId}`]
    let i = 0
    while (i < path.length) {
      const key = path[i]
      const colonIdx = key.indexOf(':')
      const kind = key.slice(0, colonIdx) as PathEntry['kind']
      const id = parseInt(key.slice(colonIdx + 1))
      if (kind === 'comment') { i++; continue }

      const open = openChild[key]
      if (open) {
        const openColonIdx = open.indexOf(':')
        const edgeType = open.slice(0, openColonIdx) as EdgeType
        const childId = parseInt(open.slice(openColonIdx + 1))
        const childKind: PathEntry['kind'] =
          edgeType === 'hasArgument' ? 'argument'
            : edgeType === 'hasPremise' ? 'statement'
              : 'comment'
        path.push(`${childKind}:${childId}`)
      }
      i++
    }
    return path
  })

  onMount(async () => {
    const data = await rpc('getClaimGraph', { claimId: mainClaimId })
    batch(() => {
      setStatementsById(data.statementsById)
      setArgumentsById(data.argumentsById)
      setCommentsById(data.commentsById)
      setEdges(data.edges)
    })
  })

  return (
    <div class="max-w-full w-lg flex flex-col gap-4 mx-auto py-4">
      <div class="flex justify-center">
        <TextButtonLink label="Home" color="gray" href="/say" />
      </div>
      <Show when={statementsById[mainClaimId]} fallback={<div>Loading...</div>}>
        <For each={buildPath()}>
          {key => {
            const colonIdx = key.indexOf(':')
            const kind = key.slice(0, colonIdx) as PathEntry['kind']
            const id = parseInt(key.slice(colonIdx + 1))
            return <Dynamic
              component={cardComponents[kind]}
              id={id}
              mainClaimId={mainClaimId}
            statementsById={statementsById}
            argumentsById={argumentsById}
            commentsById={commentsById}
            edges={edges}
            openChild={openChild}
              toggleChild={toggleChild}
            />
          }}
        </For>
      </Show>
    </div>
  )
}