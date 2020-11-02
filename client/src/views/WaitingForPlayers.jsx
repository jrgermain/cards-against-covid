import React, { Component } from 'react';
import PlayerList from '../components/PlayerList';
import './WaitingForPlayers.css';
import Button from '../components/Button';

class WaitingForPlayers extends Component {
    render() {

        const DEMO_DATA = [
            {name: "Joey"}
        ]
        return (
            <div className="view" id="waiting-for-players">
                <h1>Waiting for players...</h1>
                <main>
                    <section className="user-info">
                        <h2>About you</h2>
                        <div>
                            <span>Your game code: </span>
                            <strong className="game-code">{this.props.match.params.game}</strong>
                        </div>
                        <div>
                            <span>Your name: </span>
                            <strong className="player-name">Joey</strong>
                        </div>
                    </section>
                    <section className="currently-joined">
                        <h2>Currently joined:</h2>
                        <PlayerList players={DEMO_DATA}></PlayerList>
                    </section>
                    <section className="change-name">
                        <Button>Change My Name</Button>
                    </section>
                    <section className="start-game">
                        <Button link="/play">Everybody's In</Button>
                    </section>
                </main>

            </div>
          );
    }
}

export default WaitingForPlayers;
