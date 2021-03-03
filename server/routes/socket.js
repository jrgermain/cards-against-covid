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
        const existingPlayer = game.players.find(player => player.name === name);
        if (existingPlayer) {
            console.log(`Socket: Player "${name}" rejoined game "${gameCode}".`);
        } else {
            const player = new Player(name);
            game.players.push(player);
            reduxUpdate(gameCode)("players/add", player);
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


    // TODO: Below is for testing only. Replace this with a method that uses a specific card instead of just picking the last one.
    socket.on('test: pop card', (gameCode, username) => {
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const user = game.players.find(user => user.name === username);
        if (!user) {
            return;
        }
        
        user.response = user.cards.pop();
        reduxUpdate(gameCode)("players/set", game.players); // Send updated card list
    });
   
    socket.on('judge select', (gameCode, playerName) => {
        console.log(gameCode, playerName)
        const game = games[gameCode];
        if (!game) {
            return;
        }
        const player = game.players.find(user => user.name === playerName);
        player.score++;
        game.nextRound();

        console.log(`Socket: Judge picked ${playerName}'s card and awarded a point. Game "${gameCode}" advanced to next round.`);
        reduxUpdate(gameCode)("status/nextRound");
        reduxUpdate(gameCode)("players/set", game.players); // To update points and roles
        reduxUpdate(gameCode)("prompt/set", game.prompt);
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

});