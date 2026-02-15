import { type Component } from 'solid-js'
import { Navigate, Route, Router } from '@solidjs/router'
import { Home } from './Home'
import { Argue } from './Argue'

export const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={() => <Navigate href="/tab/politics" />} />
      <Route path="/tab/:tab" component={Home} />
      <Route path="/argue/:id" component={Argue} />
    </Router>
  )
}
