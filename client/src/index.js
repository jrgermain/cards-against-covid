import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Start from './views/Start'
import ChooseDeck from './views/ChooseDeck';
import Join from './views/Join';
import Play from './views/Play';
import WaitingForPlayers from './views/WaitingForPlayers';
import Expansions from './views/Expansions';
import 'normalize.css';
import { io } from 'socket.io-client';
import { store, persistor } from './redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as reduxListener from './redux/socket';
import GameOver from './views/GameOver';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Start} />
            <Route path="/start" component={ChooseDeck} />
            <Route path="/join" component={Join} />
            <Route path="/waiting" component={WaitingForPlayers} />
            <Route path="/play" component={Play} />
            <Route path="/expansions" component={Expansions} />
            <Route path="/game-over" component={GameOver} />
          </Switch>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

const socket = io({ transports: ["websocket"] });
reduxListener.initialize();

export { socket };