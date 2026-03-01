import { type Component } from 'solid-js'
import { Navigate, Route, Router } from '@solidjs/router'
import { Home } from './Home'
import { Argue } from './argue/Argue'
import { Derivation } from './Derivation'
import { Tutorial } from './tutorial/Tutorial'

export const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={() => <Navigate href={
        localStorage.getItem('skipTutorial') === 'true'
            ? '/tab/politics/USA'
            : '/tutorial/1'
        } />} />
      <Route path="/tutorial/:page" component={Tutorial} />
      <Route path="/tab/politics" component={() => <Navigate href="/tab/politics/USA" />} />
      <Route path="/tab/:tab/:tab2?" component={Home} />
      <Route path="/argue/:id" component={Argue} />
      <Route path="/wtp/:argumentId" component={Derivation} />
    </Router>
  )
}
