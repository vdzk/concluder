import { createEffect, createResource, createSignal, For, Show, Suspense, type Component } from 'solid-js'
import { getPercent, rpc } from './utils'
import { A, useNavigate, useParams } from '@solidjs/router'
import { Loading } from './Loading'
import { ClaimForm } from './ClaimForm'
import { About } from './About'

interface Tab {
  label: string
}

export const tabs: Record<string, Tab> = {
  politics: {
    label: 'Politics'
  },
  philosophy: {
    label: 'Philosophy'
  },
  other: {
    label: 'Other'
  },
  about: {
    label: 'About'
  }
}

export const Home: Component = () => {
  const navigate = useNavigate()
  const params = useParams()
  const [showForm, setShowForm] = createSignal(false)
  const [saving, setSaving] = createSignal(false)
  const submitClaim = async (text: string) => {
    setSaving(true)
    const data = await rpc('addClaim', { text, tag: params.tab })
    navigate(`/argue/${data.savedId}`)
  }
  const [statements] = createResource(() => params.tab, (tag) => rpc('getTaggedClaims', { tag }))
  createEffect(() => {
    if (params.tab) {
      document.title = tabs[params.tab].label
    }
  })
  return (
    <main>
      <div class="max-w-lg mx-auto pb-16">
        <div class="flex text-center border-r border-b rounded-b-md overflow-hidden bg-white">
          <For each={Object.keys(tabs)}>
            {tabName => (
              <A
                class="flex-1 py-0.5 px-2 cursor-pointer border-l"
                classList={{
                  'bg-green-200': tabName === params.tab,
                  'hover:bg-orange-200': tabName !== params.tab,
                }}
                href={`/tab/${tabName}`}
              >
                {tabs[tabName].label}
              </A>
            )}
          </For>
        </div>
        <div class="text-center text-4xl pb-5 pt-11">
          {tabs[params.tab!].label}
        </div>
        <Show when={params.tab !== 'about'} fallback={<About />}>
          <Suspense fallback={<Loading />}>
            <div class="flex font-bold px-2 pb-1">
              <div class="flex-1">
                Claim
              </div>
              <div>
                Confidence
              </div>
            </div>
            <div class="text-lg bg-white border rounded overflow-hidden">
              <For each={statements()}>
                {statement => (
                  <A
                    href={`/argue/${statement.id}`}
                    class="flex px-2 py-1 gap-2
                    border-b last:border-b-0 hover:bg-orange-200"
                  >
                    <div class="flex-1">
                      {statement.text}
                    </div>
                    <div class="">
                      {getPercent(statement.likelihood, 0)}
                    </div>
                  </A>
                )}
              </For>
            </div>
            <button
              class="px-2 py-2 cursor-pointer hover:bg-orange-200 w-full rounded"
              onClick={() => setShowForm(prev => !prev)}
              title={showForm() ? 'cancel' : 'add claim'}
            >
              <img
                class="h-5 w-5 mx-auto"
                src={`/${showForm() ? 'minus' : 'plus'}.svg`}
              />
            </button>
            <Show when={showForm()}>
              <ClaimForm
                saving={saving()}
                onSubmitClaim={submitClaim}
              />
            </Show>
          </Suspense>
        </Show>
      </div>
    </main>
  )
}
