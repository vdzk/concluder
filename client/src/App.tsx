import { Route, Router } from '@solidjs/router'
import { MetaProvider } from '@solidjs/meta'
import { HomePage } from './pages/home/HomePage'
import { JSX } from 'solid-js'
import { DefinitionsPage } from './pages/definitions/DefinitionsPage'
import { ReasoningStepPage } from './pages/reasoningStep/ReasoningStepPage'

const Layout = (props: { children?: JSX.Element }) => {
  return (
    <div class="flex flex-col h-svh overflow-hidden">
      <main class="flex-1 min-h-0 overflow-hidden">{props.children}</main>
    </div>
  )
}

export const App = () => (
  <MetaProvider>
    <Router root={Layout}>
      <Route path="/" component={HomePage} />
      <Route path="/step/:id" component={ReasoningStepPage} />
      <Route path="/definitions/:id?" component={DefinitionsPage} />
    </Router>
  </MetaProvider>
)
