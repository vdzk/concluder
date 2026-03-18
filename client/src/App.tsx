import { type Component } from 'solid-js'
import { Navigate, Route, Router } from '@solidjs/router'
import { Home } from './Home'
import { Argue } from './argue/Argue'
import { Derivation } from './Derivation'
import { Tutorial } from './tutorial/Tutorial'
import { Move } from './move/Move'
import { MoveForm } from './move-form/MoveForm'
import { SayHome } from './say/SayHome'
import { SayNewDebate } from './say/SayNewDebate'
import { UnprocessedNewDebates } from './say/UnprocessedNewDebates'
import { ProcHome } from './proc/ProcHome'

export const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={() => <Navigate href={
        localStorage.getItem('skipTutorial') === 'true'
            ? '/tab/politics/USA'
            : '/tutorial/1'
        } />} />
      <Route path="/tutorial/:page" component={Tutorial} />
      <Route
        path="/tab/politics"
        component={() => <Navigate href="/tab/politics/USA" />}
      />
      <Route path="/tab/:tab/:tab2?" component={Home} />
      <Route path="/argue/:id" component={Argue} />
      <Route path="/wtp/:argumentId" component={Derivation} />
      <Route path="/move/:id" component={Move} />
      <Route path="/respond/:targetType/:targetId/:claimId/:moveId" component={MoveForm} />
      <Route path="/say" component={SayHome} />
      <Route path="/say/start-new-debate" component={SayNewDebate} />
      <Route path="/say/edit-new-debate/:commentId" component={SayNewDebate} />
      <Route path="/say/unprocessed-new-debates" component={UnprocessedNewDebates} />

      <Route path="/proc" component={ProcHome} />
    </Router>
  )
}
