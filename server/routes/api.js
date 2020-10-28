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

//retrieve adult deck from db
router.get('/adultDeck', async function(req, res) {
    const deck = await db.get("select * from basedecks where category like '%adult%';");
    res.send(deck);
});

//retrieve child deck from db
router.get('/childDeck', async function (req, res){
    const deck = await db.get("select * from basedecks where category like '%child%';");
    res.send(deck);
});

//getiing prompts (not seperated by category)
router.get('/getBlackCard', async function (req , res){
    const deck = await db.get("select prompt from basedecks;");
    res.send(deck);
}); 

//getting reponses (not seperated by category)
router.get('/getWhiteCard', async function (req , res){
    const deck = await db.get("select response from basedecks;");
    res.send(deck);
}); 

// If there is an "api" url that doesn't match the above, send a 404 (not found)
router.use('*', async function(req, res) {
    res.sendStatus(404);
});
 

/* 
//closes database connection at the end of game
router.endGame('/endGame', async function (req, res){
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the databaseconnection.');
    })
});  */

module.exports = router;
