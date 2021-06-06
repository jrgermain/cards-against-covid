import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Home from './screens/Home'
import StartGame from './screens/StartGame';
import Join from './screens/Join';
import Play from './screens/Play';
import WaitingForPlayers from './screens/WaitingForPlayers';
import Expansions from './screens/Expansions';
import GameOver from './screens/GameOver';
import 'normalize.css';
import { io } from 'socket.io-client';
import { store, persistor } from './redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as reduxListener from './redux/socket';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter>
          <ToastContainer position="top-center" />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/start" component={StartGame} />
            <Redirect from="/join/:code" to="/join?code=:code" />
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