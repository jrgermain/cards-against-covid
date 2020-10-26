var express = require('express');
var sqlite = require('sqlite');
var sqlite3 = require('sqlite3');
var router = express.Router();
var db;
var adultdb;
var childdb;

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
router.startGame('/startGame', async function (req, res){
    
});

//retrieve adult deck from database
router.getAdultDeck('/getAdultDeck', async function (req, res){
    adultdb = db.get("SELECT * FROM basedecks WHERE decktype LIKE 'adult%';");
});

//retrieve adult deck from database
router.getChildDeck('/getChildDeck', async function (req, res){
    childdb = db.get("SELECT * FROM basedecks WHERE decktype LIKE 'child%';");
});

// drawing a prompt card aka "black card" from db, straight from db with different data entries for each
router.drawPrompt('/drawPrompt', async function (req, res){
    const deckName = req.query.name;
    console.log("Fetching prompt", deckName)
    const prompt = await db.get("SELECT * FROM prompt ORDER BY random() LIMIT 1;", [deckName]);
    res.send(prompt);
});

// drawing a response card aka "white card" from db, straight from db with different data entries for each
router.drawResponse('/drawResponse', async function (req, res){
    const deckName = req.query.name;
    console.log("Fetching response", deckName)
    const respon = await db.get("SELECT * FROM response ORDER BY random() LIMIT 1;", [deckName]);
    res.send(respon);
});

// If there is an "api" url that doesn't match the above, send a 404 (not found)
router.use('*', async function(req, res) {
    res.sendStatus(404);
});

//closes database connection at the end of game
router.endGame('/endGame', async function (req, res){
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the databaseconnection.');
    })
});

module.exports = router;
