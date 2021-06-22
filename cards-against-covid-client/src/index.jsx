import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import "./index.css";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import Home from "./screens/Home";
import StartGame from "./screens/StartGame";
import Join from "./screens/Join";
import Play from "./screens/Play";
import WaitingForPlayers from "./screens/WaitingForPlayers";
import Expansions from "./screens/Expansions";
import GameOver from "./screens/GameOver";
import { store, persistor } from "./redux/store";
import "react-toastify/dist/ReactToastify.min.css";
import NotFound from "./screens/NotFound";
import "reactjs-popup/dist/index.css";

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
                        <Route path="/" component={NotFound} />
                    </Switch>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    </React.StrictMode>,
    document.getElementById("root"),
);
