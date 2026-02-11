import { type Component } from 'solid-js'
import { Route, Router } from '@solidjs/router'
import { Home } from './Home'
import { Argue } from './Argue'

export const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/argue/:id" component={Argue} />
    </Router>
  )
}
