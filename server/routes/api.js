var express = require('express');
var sqlite = require('sqlite');
var sqlite3 = require('sqlite3');
var Deck = require('../types/Deck');
var Game = require('../types/Game');
var Player = require('../types/Player');
var GameCode = Game.Code;
var router = express.Router();
var dbLoader = require('../db/loader');
var db;
var adultdb;
var childdb;
var games = {};

// Open a database connection when initializing the server
dbLoader.connect().then(connection => db = connection).catch(console.warn);

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
    const deck = await db.all("select * from basedecks where category like '%adult%';");
    res.send(deck);
});

router.post('/adultDeck', async function(req, res) {
    const deck = await db.all("select * from basedecks where category like '%adult%';");
    res.send(deck);
});

//retrieve child deck from db
router.get('/childDeck', async function (req, res){
    const deck = await db.all("select * from basedecks where category like '%child%';");
    res.send(deck);
});

router.post('/childDeck', async function (req, res){
    const deck = await db.all("select * from basedecks where category like '%child%';");
    res.send(deck);
});

//retreive and post for ault disney pack
router.get('/packDisney', async function (req, res){
    const deck = await db.all("select * from disneydeck;");
    res.send(deck);
});

router.post('/packDisney', async function (req, res){
    const deck = await db.all("select * from disneydeck;");
    res.send(deck);
});

//retrieve and post for child disney pack
router.get('/childPackDisney', async function (req, res){
    const deck = await db.all("select * from childdisneydeck;");
    res.send(deck);
});

router.post('/childPackDisney', async function (req, res){
    const deck = await db.all("select * from childdisneydeck;");
    res.send(deck);
});

//retreive and post for vine pack 
router.get('/packVine', async function (req, res){
    const deck = await db.all("select * from vinedeck;");
    res.send(deck);
});

router.post('/packVine', async function (req, res){
    const deck = await db.all("select * from vinedeck;");
    res.send(deck);
});

//retreive and post for covid pack 
router.get('/packCovid', async function (req, res){
    const deck = await db.all("select * from coviddeck;");
    res.send(deck);
});

router.post('/packCovid', async function (req, res){
    const deck = await db.all("select * from coviddeck;");
    res.send(deck);
});

//retreive and post for harry potter pack 
router.get('/packHarryPotter', async function (req, res){
    const deck = await db.all("select * from harrypotterdeck;");
    res.send(deck);
});

router.post('/packHarryPotter', async function (req, res){
    const deck = await db.all("select * from harrypotterdeck;");
    res.send(deck);
});

//getiing prompts (not seperated by category)
router.get('/getBlackCard', async function (req , res){
    const deck = await db.all("select prompt from basedecks;");
    res.send(deck);
}); 

//getting reponses (not seperated by category)
router.get('/getWhiteCard', async function (req , res){
    const deck = await db.all("select response from basedecks;");
    res.send(deck);
}); 

router.post('/startGame', async function(req, res) {
    const deckName = req.body.deck;
    const deck = new Deck("Empty Deck", [], []); // TODO: Use a real deck instead of an empty one
    const code = GameCode.generate(games);
    games[code] = new Game(deck);
    console.log(`Started new game with code "${code}": `, games[code]);
    res.send(code);
});

router.post('/joinGame', async function(req, res) {
    const code = (req.body.code || "").toUpperCase();
    const name = req.body.name;
    const game = games[code];

    if (game) {
        game.players.push(new Player(name));
        console.log(`Player "${name}" joined game "${code}". Current player list: `, game.players);
        res.send(game);
    } else {
        console.warn(`Game "${code}" was not found.`);
        res.sendStatus(404);
    }
});

router.get('/playerList', async function(req, res) {
    const code = (req.query.code || "").toUpperCase();
    const game = games[code];

    if (game) {
        res.send(game.players);
    } else {
        console.warn(`Game "${code}" was not found.`);
        res.sendStatus(404);
    }
})

// If there is an "api" url that doesn't match the above, send a 404 (not found)
router.use('*', async function(req, res) {
    res.sendStatus(404);
});
 


module.exports = router;