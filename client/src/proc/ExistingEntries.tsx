import { Accessor, Component, createEffect, createSignal, For, Setter } from "solid-js"
import { createStore } from "solid-js/store"
import { CommentRecord } from "../../../shared/types"
import { rpc } from "../utils"
import { Argument, Comment, EdgeType, Statement } from "../say/cardTypes"
import { ExistingCard } from "./ExistingCard"

const STORAGE_KEY = 'openEntries'
type OpenEntry = { id: number, type: 'argument' | 'statement', localId: number }

interface Props {
  comment: CommentRecord | undefined
  nextEntryId: Accessor<number>
  setNextEntryId: Setter<number>
}

export const ExistingEntries: Component<Props> = (props) => {
  const [statementsById, setStatementsById] = createStore<Record<number, Statement>>({})
  const [argumentsById, setArgumentsById] = createStore<Record<number, Argument>>({})
  const [commentsById, setCommentsById] = createStore<Record<number, Comment>>({})
  const [edges, setEdges] = createStore<Record<EdgeType, Record<number, number[]>>>(
    { hasArgument: {}, hasPremise: {}, statementHasComment: {}, argumentHasComment: {} }
  )
  const [openEntries, setOpenEntries] = createStore<OpenEntry[]>([])
  const [graphLoaded, setGraphLoaded] = createSignal(false)

  createEffect(async () => {
    const argumentId = props.comment?.argument_id
    if (argumentId == null) return

    const { claimId } = await rpc('getClaimIdByDescendant', { argumentId })
    if (claimId == null) return

    const graph = await rpc('getClaimGraph', { claimId })
    setStatementsById(graph.statementsById)
    setArgumentsById(graph.argumentsById)
    setCommentsById(graph.commentsById)
    setEdges(graph.edges)

    const saved = localStorage.getItem(STORAGE_KEY)
    const restored: OpenEntry[] = saved ? JSON.parse(saved) : []

    if (restored.length > 0) {
      setOpenEntries(restored)
      const maxLocalId = Math.max(...restored.map(e => e.localId))
      if (maxLocalId >= props.nextEntryId()) props.setNextEntryId(maxLocalId + 1)
    } else {
      const argumentEntry = graph.argumentsById[argumentId]
      if (argumentEntry) {
        const localId = props.nextEntryId()
        props.setNextEntryId(prev => prev + 1)
        const initial: OpenEntry[] = [{ id: argumentEntry.id, type: 'argument', localId }]
        setOpenEntries(initial)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      }
    }

    setGraphLoaded(true)
  })

  createEffect(() => {
    if (!graphLoaded()) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openEntries))
  })

  return (
    <div class="w-2xl flex flex-col gap-4 px-2 py-2">
      <For each={graphLoaded() ? openEntries : []}>
        {(ref, index) => {
          const entry = ref.type === 'argument'
            ? argumentsById[ref.id]
            : statementsById[ref.id]
          return entry
            ? <ExistingCard type={ref.type} entry={entry} localId={ref.localId} isTarget={index() === 0} />
            : null
        }}
      </For>
    </div>
  )
}
