var { games, server } = require('../app');
var Player = require("../types/Player"); 
var io = require('socket.io')(server);

// Send state updates to be consumed by redux on the client side
// Usage: reduxUpdate([socket id OR room code])([action type], [data])
function reduxUpdate(gameCode) {
    return (type, payload) => { io.to(gameCode).emit("redux action", { type, payload }) };
}

// Event handlers
io.on('connection', socket => {
    console.log("Socket: New connection");

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

        // Award winning player a point
        winner.score++;

        console.log(`Socket: Judge picked ${playerName}'s card and awarded a point.`);
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
        if (game.players.every(player => player.isReadyForNextRound)) {
            // Discard used responses
            for (const player of game.players) {
                player.cards = player.cards.filter(card => !player.responses.includes(card));
            }
            console.log(`Game "${gameCode}" advanced to next round.`);
            game.nextRound();
            reduxUpdate(gameCode)("status/nextRound");
            reduxUpdate(gameCode)("prompt/set", game.prompt);
            reduxUpdate(gameCode)("players/set", game.players); // To update roles and cards
        }
    });


    socket.on('client reload', (gameCode, playerName) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const isValidRequest = game.players.some(user => user.name === playerName);
        
        if (isValidRequest && !socket.rooms.has(gameCode)) {
            socket.join(gameCode);
        }
    });

    socket.on('disconnect', (reason) => {
        if (socket._gameData) {
            const { gameCode, name } = socket._gameData;
            console.log(`Socket: Player "${name}" disconnected from game "${gameCode}". Reason: ${reason}`);
            const game = games[gameCode];
            if (game) {
                // Remove player from game
                game.players = game.players.filter(player => player.name !== name);
                reduxUpdate(gameCode)("players/remove", name);
                
                // If this was the last player, delete the game
                if (game.players.length === 0) {
                    delete games[gameCode];
                }
            }
        }
    });

});