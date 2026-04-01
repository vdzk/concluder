import { Route, Router } from '@solidjs/router'
import { ReasoningStepPage } from './pages/ReasoningStepPage'
import { Home } from './pages/Home'
import { DefinitionPage } from './pages/DefinitionPage'
import { DefinitionsPage } from './pages/DefinitionsPage'
import { Header } from './components/Header'
import { Component, JSX } from 'solid-js'

const Layout = (props: { children?: JSX.Element }) => (
  <div class="flex flex-col h-screen overflow-hidden">
    <Header />
    <main class="flex-1 min-h-0 overflow-hidden">{props.children}</main>
  </div>
);

const App = () => (
  <Router root={Layout}>
    <Route path="/" component={Home} />
    <Route path="/step/:id" component={ReasoningStepPage} />
    <Route path="/definitions" component={DefinitionsPage as Component} />
    <Route path="/definition/:id" component={DefinitionPage} />
  </Router>
);

export default App;
