import React from 'react'
import { Route, Switch } from 'react-router-dom'

import GenePage from './GenePage/GenePage'
import GeneResultsPage from './GeneResultsPage/GeneResultsPage'
import HomePage from './HomePage'
import TopBar from './TopBar'

const App = () => (
  <div>
    <TopBar />
    {window.gtag && (
      <Route
        path="/"
        render={({ location }) => {
          window.gtag('config', window.gaTrackingId, {
            anonymize_ip: true,
            page_path: location.pathname,
          })
          return null
        }}
      />
    )}
    <Switch>
      <Route path="/" exact component={HomePage} />
      <Route path="/results" component={GeneResultsPage} />
      <Route path="/gene/:gene" render={({ match }) => <GenePage geneName={match.params.gene} />} />
    </Switch>
  </div>
)

export default App
