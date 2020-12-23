import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom';
import Start from './views/Start'
import ChooseDeck from './views/ChooseDeck';
import Join from './views/Join';
import Play from './views/Play';
import WaitingForPlayers from './views/WaitingForPlayers';
import Expansions from './views/Expansions';
import 'normalize.css';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Start} />
        <Route path="/start" component={ChooseDeck} />
        <Redirect from="/join/*" to="/waiting" />
        <Route path="/join" component={Join} />
        <Route path="/waiting/:game" component={WaitingForPlayers} />
        <Route path="/play" component={Play} />
        <Route path="/expansions" component={Expansions} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
