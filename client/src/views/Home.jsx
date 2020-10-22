import React, { Component } from 'react';
import './Home.css';

class Home extends Component {
    render() {
        return (
            <div id="home">
                <h1 id="game-logo">Cards Against Covid</h1>
                <section className="button-group">
                    <button>Join Game</button>
                    <button>Start Game</button>
                    <button>Decks</button>
                </section>
            </div>
          );
    }
}

export default Home;
