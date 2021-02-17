var { games, server } = require('../app');
var Player = require("../types/Player"); 
var io = require('socket.io')(server);

// Send state updates to be consumed by redux on the client side
function reduxUpdate(gameCode) {
    return (type, payload, { error, meta } = {}) => { io.to(gameCode).emit("redux action", { type, payload, error, meta }) };
}

// Send update to the in-game chat
function chatUpdate(gameCode) {
    return message => io.to(gameCode).emit('new message', message);
}

// Event handlers
io.on('connection', socket => {
    console.log("Socket: New connection");
    socket.on('join game', (gameCode, name) => {
        // Assign this player to a room based on game code
        socket.join(gameCode);

        // Update game state
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const player = new Player(name);
        game.players.push(player);

        console.log(`Socket: Player "${name}" joined game "${gameCode}". Current player list: `, game.players.map(player => player.name));
        reduxUpdate(gameCode)("players/add", player);
    });

    socket.on('start game', (gameCode) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        game.start();
        game.nextRound();

        console.log(`Socket: Game "${gameCode}" has started.`);
        reduxUpdate(gameCode)("status/set", game.state.description);
        reduxUpdate(gameCode)("players/set", game.players);
        reduxUpdate(gameCode)("prompt/set", game.prompt);
    });

    socket.on('new message', (gameCode, sender, content) => {
        chatUpdate(gameCode)({ sender, content });
    });


    // Below is for testing only. Remove once player roles are implemented.
    socket.on('test: advance game', (gameCode) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        game.nextRound();

        console.log(`Socket: Advanced game "${gameCode}" to next round.`);
        reduxUpdate(gameCode)("players/set", game.players); // To update cards and statuses
        reduxUpdate(gameCode)("prompt/set", game.prompt);
    });
    socket.on('test: pop card', (gameCode, username) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const user = game.players.find(user => user.name === username);
        if (!user) {
            return;
        }
        user.cards.pop();
        reduxUpdate(gameCode)("players/set", game.players); // Send updated card list
    });
   
});