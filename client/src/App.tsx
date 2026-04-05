import { Route, Router, useLocation } from '@solidjs/router'
import { MetaProvider } from '@solidjs/meta'
import { ReasoningStepPage } from './pages/ReasoningStepPage'
import { Home } from './pages/Home'
import { DefinitionsPage } from './pages/DefinitionsPage'
import { Header } from './components/Header'
import { Component, JSX, Show } from 'solid-js'

const Layout = (props: { children?: JSX.Element }) => {
  const location = useLocation();
  const showHeader = () => !location.pathname.startsWith('/step/');
  return (
    <div class="flex flex-col h-svh overflow-hidden">
      <Show when={false && showHeader()}>
        <Header />
      </Show>
      <main class="flex-1 min-h-0 overflow-hidden">{props.children}</main>
    </div>
  );
};

const App = () => (
  <MetaProvider>
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/step/:id" component={ReasoningStepPage} />
      <Route path="/definitions/:id?" component={DefinitionsPage as Component} />
    </Router>
  </MetaProvider>
);

export default App;
