import { createEffect, createResource, createSignal, For, Show, Suspense, type Component } from 'solid-js'
import { getPercent, rpc } from './utils'
import { A, useNavigate, useParams } from '@solidjs/router'
import { Loading } from './Loading'
import { ClaimForm } from './ClaimForm'
import { countries } from '../../shared/constants'

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
  }
}

const countryCodes = Object.keys(countries)

export const Home: Component = () => {
  const navigate = useNavigate()
  const params = useParams()
  const [showForm, setShowForm] = createSignal(false)
  const [saving, setSaving] = createSignal(false)
  const submitClaim = async (text: string) => {
    setSaving(true)
    const data = await rpc('addClaim', {
      text, tag: params.tab, countryCode: params.tab2
    })
    navigate(`/argue/${data.savedId}`)
  }
  const [statements] = createResource(
    () => [params.tab, params.tab2],
    ([tag, countryCode]) => rpc('getTaggedClaims', { tag, countryCode })
  )
  createEffect(() => {
    if (params.tab) {
      let title = tabs[params.tab].label
      if (params.tab === 'politics' && params.tab2) {
        title += ` - ${countries[params.tab2]}`
      }
      document.title = title
    }
  })

  return (
    <main class="w-lg max-w-full mx-auto pb-16 px-1">
      <div class="flex text-center divide-x border-x border-b rounded-b-lg overflow-hidden bg-white dark:bg-gray-800">
        <For each={Object.keys(tabs)}>
          {tabName => (
            <A
              class="flex-1 py-0.5 px-2 cursor-pointer"
              classList={{
                'bg-green-200 dark:bg-green-900': tabName === params.tab,
                'hover:bg-orange-200 dark:hover:bg-orange-700': tabName !== params.tab,
              }}
              href={`/tab/${tabName}`}
            >
              {tabs[tabName].label}
            </A>
          )}
        </For>
        <A
          class="flex-1 py-0.5 px-2 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-700"
          href="/tutorial/1"
        >
          Tutorial
        </A>
      </div>
      <div class="text-center text-4xl pb-5 pt-11">
        {tabs[params.tab!].label}
      </div>
      <Show when={params.tab === 'politics'}>
        <div class="flex justify-center">
          <div class="flex text-center border rounded-full divide-x overflow-hidden bg-white dark:bg-gray-800 -mt-3 mb-10">
            <For each={countryCodes}>
              {(countryCode, index) => (
                <A
                  href={`/tab/politics/${countryCode}`}
                  class="py-0.5 px-3 cursor-pointer"
                  classList={{
                    'bg-green-200 dark:bg-green-900': countryCode === params.tab2,
                    'hover:bg-orange-200 dark:hover:bg-orange-700': countryCode !== params.tab2,
                    'pl-4': index() === 0,
                    'pr-4': index() === countryCodes.length - 1
                  }}
                >
                  {countries[countryCode]}
                </A>
              )}
            </For>
          </div>

        </div>
      </Show>
      <Suspense fallback={<Loading />}>
        <div class="flex font-bold px-2 pb-1">
          <div class="flex-1">
            Claim
          </div>
          <div>
            Confidence
          </div>
        </div>
        <div class="sm:text-lg bg-white dark:bg-gray-800 border rounded overflow-hidden">
          <For each={statements()}>
            {statement => (
              <A
                href={`/argue/${statement.id}`}
                class="flex px-2 py-1 gap-2
                    border-b last:border-b-0 hover:bg-orange-200 dark:hover:bg-orange-900"
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
          class="px-2 py-2 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900 w-full rounded"
          onClick={() => setShowForm(prev => !prev)}
          title={showForm() ? 'cancel' : 'add claim'}
        >
          <img
            class="h-5 w-5 mx-auto dark:invert"
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
    </main>
  )
}
