var express = require('express');
var sqlite = require('sqlite');
var sqlite3 = require('sqlite3');
var router = express.Router();
var db;

// Open a database connection when initializing the server
sqlite.open({
    filename: './db/game.db',
    driver: sqlite3.Database
}).then(connection => { db = connection })
.catch(error => console.log("Error connecting to database", error));

/************************************************************
 * Below are the request mappings for urls relative to /api *
 ************************************************************/

// Handle a GET request to http://{gameserver}/api/getDeck
// example: http://localhost:3001/api/getDeck?name=Cards%20Against%20Humanity
router.get('/getDeck', async function(req, res) {
    const deckName = req.query.name;
    console.log("Fetching deck", deckName)
    const deck = await db.get("SELECT * FROM deck WHERE name = ?;", [deckName]);
    res.send(deck);
});

// Handle a POST request to http://{gameserver}/api/testPost
router.post('/testPost', async function(req, res) {
    res.send("Got it. Thanks for POSTing");
});

// CONCEPT: make "copies" of each database, each server will play with their "copy" of the db decks (shuffle, pull cards etc)
// a place to store and manage each games deck


// drawing a prompt card aka "black card" from db
router.drawPrompt('/drawPrompt', async function (req, res){
    const deckName = req.query.name;
    console.log("Fetching prompt", deckName)
    const prompt = await db.get("SELECT * FROM prompt_json ORDER BY random() LIMIT 1;", [deckName]);
    res.send(prompt);
});

// drawing a response card aka "white card" from db 
router.drawResponse('/drawResponse', async function (req, res){
    const deckName = req.query.name;
    console.log("Fetching response", deckName)
    const respon = await db.get("SELECT * FROM response_json ORDER BY random() LIMIT 1;", [deckName]);
    res.send(respon);
});

// If there is an "api" url that doesn't match the above, send a 404 (not found)
router.use('*', async function(req, res) {
    res.sendStatus(404);
});

module.exports = router;
