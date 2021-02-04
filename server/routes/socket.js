var { games, server } = require('../app');
var Player = require("../types/Player"); 
var io = require('socket.io')(server);

// Send an 'updated' event to the client with the game's data
function sendUpdate(gameCode) {
    io.to(gameCode).emit('game updated', games[gameCode].toClientData());
}

io.on('connection', socket => {
    console.log("Socket: New connection");
    socket.on('join game', (gameCode, name) => {
        // Assign this player to a room based on game code
        socket.join(gameCode);

        // Update game state
        const game = games[gameCode];
        const player = new Player(name);
        game.players.push(player);
        console.log(`Socket: Player "${name}" joined game "${gameCode}". Current player list: `, game.players.map(player => player.name));

        sendUpdate(gameCode);
    });

    socket.on('start game', (gameCode) => {
        games[gameCode].start();
        console.log(`Socket: Game "${gameCode}" has started.`);
        sendUpdate(gameCode);
    });

    socket.on('new message', (gameCode, name, message) => {
        io.to(gameCode).emit('new message', name, message);
    });
   
});