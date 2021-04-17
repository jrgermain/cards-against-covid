var { games, server } = require('../app');
const Game = require('../types/Game');
var Player = require("../types/Player"); 
var io = require('socket.io')(server);

// Send state updates to be consumed by redux on the client side
// Usage: reduxUpdate([socket id OR room code])([action type], [data])
function reduxUpdate(gameCode) {
    return (type, payload) => { io.to(gameCode).emit("redux action", { type, payload }) };
}

// Socket functionality (applied to each indiviudal connection)
io.on('connection', socket => {
    console.log("Socket: New connection");

    /********************
     * Common functions *
     ********************/

    // Move a game to the next round
    const nextRound = (gameCode) => {
        const game = games[gameCode];
        if (game) {
            game.nextRound();
            reduxUpdate(gameCode)("status/setName", game.state.description);
            reduxUpdate(gameCode)("status/nextRound");
            reduxUpdate(gameCode)("prompt/set", game.prompt);
            reduxUpdate(gameCode)("players/set", game.players); // To update roles and cards    
        }
    }


    /******************
     * Event handlers *
     ******************/

    socket.on('join game', (gameCode, name) => {
        // Assign this player to a room based on game code
        socket.join(gameCode);

        // Set data on socket instance
        socket._gameData = { gameCode, name };

        // Update game state
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const existingPlayer = game.players.find(player => player.name === name);
        if (existingPlayer) {
            // Player was already in the game and reconnected
            console.log(`Socket: Player "${name}" rejoined game "${gameCode}".`);
            existingPlayer.isConnected = true;

            // Make sure the player has the correct player list in case people joined while they were away
            // Send the list to the player who rejoined, but don't send it to everyone else (since no NEW player joined)
            reduxUpdate(socket.id)("players/set", game.players);
        } else {
            // Add the player to the game, then update the player list for people currently connected.
            const player = new Player(name);
            game.players.push(player);
            reduxUpdate(gameCode)("players/set", game.players);
            console.log(`Socket: Player "${name}" joined game "${gameCode}". Current player list: `, game.players.map(player => player.name));
        }
    });

    socket.on('start game', (gameCode) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        game.start();
        game.nextRound();

        console.log(`Socket: Game "${gameCode}" has started.`);
        reduxUpdate(gameCode)("status/setName", game.state.description);
        reduxUpdate(gameCode)("status/setMaxRounds", game.round + game.calculateRoundsLeft());
        reduxUpdate(gameCode)("players/set", game.players);
        reduxUpdate(gameCode)("prompt/set", game.prompt);
    });

    socket.on('new message', (gameCode, sender, content) => {
        const message = { sender, content };
        reduxUpdate(gameCode)("messages/add", message);
    });

    socket.on('answer select', (gameCode, username, index) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const user = game.players.find(user => user.name === username);
        if (!user) {
            return;
        }

        // Get number of cards required to fully answer the prompt
        const blanks = game.prompt.match(/_+/g);
        const cardsRequired = blanks ? blanks.length : 1;

        // Only do something if there is at least one player who hasn't (fully) answered yet. Otherwise, the game is locked while the judge picks a winner.
        if (game.players.some(player => !player.isJudge && player.responses.length < cardsRequired)) {
            const cardText = user.cards[index];

            // If the card is already selected, deselect it. Otherwise, add it.
            if (user.responses.includes(cardText)) {
                // Remove the selected card (use indexOf instead of filtering by text in case there are identical cards)
                user.responses.splice(user.responses.indexOf(cardText), 1);
                console.log(`Socket: Answer from ${username} deselected. Card: "${cardText}"`);
            } else {
                // Card has not been selected yet
                if (cardsRequired === 1) {
                    // For a single-select prompt, selecting a new card sets the response to that card.
                    // If another card was selected, just de-select it automatically.
                    user.responses = [cardText];
                } else if (user.responses.length < cardsRequired) {
                    // For a multi-select prompt, make the user toggle a card off if they try to select more cards than the prompt specifies
                    user.responses.push(cardText);
                } else {
                    /* The current round is a multi-select, and the player has already selected all their cards.
                     * They shouldn't be able to select more because there's no clear answer as to what should
                     * happen. If they want to amend their answer, they should de-select a card first.
                     */

                    // TODO: show an error on player's screen
                    console.log(`Socket: ${username} tried to select a card but has already played ${user.responses.length} cards. Tell them to deselect one first!`);
                    return;
                }
                console.log(`Socket: Answer from ${username} selected. Card: "${cardText}"`);
            }
            reduxUpdate(gameCode)("players/set", game.players);
        }
    });

   
    socket.on('judge select', (gameCode, playerName) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const winner = game.players.find(user => user.name === playerName);
        if (!winner) {
            return;
        }

        const winnerResponse = winner.responses; 
        winner.isWinner = true; 
        // Award winning player a point
        winner.score++;

        console.log(`Socket: Judge picked ${playerName}'s card and awarded a point. "${winnerResponse}"`);
        reduxUpdate(gameCode)("players/set", game.players); // To update points
        reduxUpdate(gameCode)("status/showLeaderboard");
    });

    socket.on('player ready', (gameCode, playerName) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const player = game.players.find(user => user.name === playerName);
        if (!player) {
            return;
        }

        player.isReadyForNextRound = true;

        // If all players are ready, advance the game
        if (game.players.every(player => player.isReadyForNextRound || !player.isConnected)) {
            console.log(`Game "${gameCode}" advanced to next round.`);
            nextRound(gameCode);
        }
    });


    socket.on('client reload', (gameCode, playerName) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }

        // Look for the player -- must match game code and name and be disconnected
        const player = game.players.find(user => !user.isConnected && user.name === playerName);
        if (player) {
            console.log(`Player "${player.name}" reconnected`);
            player.isConnected = true;
            socket.join(gameCode);
            socket._gameData = { gameCode, name: playerName }
        }
    });

    socket.on('change name', (gameCode, oldName, newName) => {
        const game = games[gameCode];
        const player = game.players.find(player => player.name === oldName);
        if (player) {
            player.name = newName;
            socket._gameData.name = newName;
            reduxUpdate(gameCode)("players/set", game.players);
            reduxUpdate(socket.id)("user/setName", newName);
            console.log(`Socket: Name Change . Current player list: `, game.players.map(player => player.name));
        }
    }); 

    socket.on('disconnect', (reason) => {
        if (socket._gameData) {
            const { gameCode, name } = socket._gameData;
            console.log(`Socket: Player "${name}" disconnected from game "${gameCode}". Reason: ${reason}`);
            const game = games[gameCode];
            if (game) {
                const playerWhoLeft = game.players.find(player => player.name === name);
                const playerWhoLeftIndex = game.players.indexOf(playerWhoLeft);

                // Set player as inactive
                playerWhoLeft.isConnected = false;

                // Give the players 2 seconds to reconnect before treating it as "leaving" so refreshing the page doesn't cause an issue
                setTimeout(() => {
                    if (game) {
                        const playerIsConnected = game.players.some(player => player.name === name && player.isConnected);
                        if (!playerIsConnected) {
                            // Update other players' screens to show that the player left
                            reduxUpdate(gameCode)("players/remove", name);
    
                            // Get number of active players
                            const numConnectedPlayers = game.players.filter(player => player.isConnected).length;

                            // If this was the last player, delete the game
                            if (numConnectedPlayers === 0) {
                                delete games[gameCode];
                                console.log(`Socket: All players left game "${gameCode}". Game deleted.`);
                            }
                            // If the number of players is now below 3, end the game if it is in progress
                            else if (game.state === Game.State.IN_PROGRESS && numConnectedPlayers < 3) {
                                console.log(`Socket: A player left game "${gameCode}", which now has fewer than 3 players. Game ending.`);
                                game.end();
                                reduxUpdate(gameCode)("status/setName", game.state.description);
                                reduxUpdate(gameCode)("players/set", game.players); // To update who the winner is
                            }
                            //  We still have a valid number of players
                            else if (game.state === Game.State.IN_PROGRESS) {
                                // If everyone is waiting for the next round and a player leaves instead of accepting, make sure the game advances
                                if (game.players.every(player => player.isReadyForNextRound || !player.isConnected)) {
                                    console.log(`Game "${gameCode}" advanced to next round.`);
                                    nextRound(gameCode);
                                }
                                // If the player who left was a judge, have the next player judge
                                else if (playerWhoLeft.isJudge) {
                                    const nextJudge = game.getNextJudge();
                                    nextJudge.isJudge = true;
                                    playerWhoLeft.isJudge = false;
                                    console.log(`The judge, "${playerWhoLeft.name}", left game "${gameCode}", so the judging role was transferred to "${nextJudge.name}".`);
                                    reduxUpdate(gameCode)("players/set", game.players)    
                                }

                                // Update maximum number of rounds on players' screens, since it might increase
                                reduxUpdate(gameCode)("status/setMaxRounds", game.round + game.calculateRoundsLeft());
                            }
                            // The player left before the game started
                            else if (game.state === Game.State.WAITING) {
                                // Completely remove the player from the game (instead of only marking them as inactive)
                                game.players = game.players.filter(player => player.name !== name);
                            }
                        }
                    }
                }, 2000);
            }
        }
    });

});