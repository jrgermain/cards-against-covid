var express = require('express');
var Deck = require('../types/Deck');
var Game = require('../types/Game');
var cards = require('../cards/loader');
var router = express.Router();
var games = require('../app').games;

// Handle a GET request to http://{gameserver}/api/deckList
router.get('/deckList', async function(req, res) {
    const decks = await cards.getDecks();
    const deckInfo = decks.map(deck => ({
        name: deck.name,
        numPrompts: deck.prompts.length,
        numResponses: deck.responses.length
    }));
    res.send(deckInfo);
});

router.get('/expansionList', async function(req, res) {
    const packs = await cards.getExpansionPacks();
    const packInfo = packs.map(pack => ({
        name: pack.name,
        numPrompts: pack.prompts.length,
        numResponses: pack.responses.length
    }));
    res.send(packInfo);
});

router.get('/gameState', async function(req, res) { 
    const gameCode = req.query.code;
    res.status(200).send(gameCode in games ? games[gameCode].state.description : "INVALID");
})

router.post('/startGame', async function(req, res) {
    const { deckName, expansionPacks, roundLimit } = req.body;

    const allDecks = await cards.getDecks();
    const allPacks = await cards.getExpansionPacks();
    const selectedDeck = allDecks.find(deck => deck.name === deckName);
    const filteredPacks = allPacks.filter(pack => expansionPacks.includes(pack.name));
    const combinedCards = [selectedDeck, ...filteredPacks]
            .map(cards => new Deck(cards)) // Get an array of Deck objects
            .reduce(Deck.combine)          // Flatten into one deck
            .shuffle();                    // Shuffle the cards into a random order

    const code = Game.Code.generate(games);
    games[code] = new Game(combinedCards, roundLimit);
    console.log(`Started new game with code "${code}"`);
    res.send(code);
});

router.post('/joinGame', async function(req, res) {
    const code = (req.body.code || "").toUpperCase();
    const name = req.body.name;
    const game = games[code];

    if (!game) {
        console.warn(`Game "${code}" was not found.`);
        res.sendStatus(404);
        return;
    } 
    
    switch (game.state) {
        case Game.State.WAITING:
            if (game.players.some(player => player.name === name)) {
                // Game is on lobby screen and player chooses the name of someone in the lobby
                res.sendStatus(400);
            } else {
                // Game is on lobby screen and player chooses a unique name
                res.sendStatus(200);
            }
            break;
        case Game.State.IN_PROGRESS:
            if (game.players.some(player => player.name === name && !player.isConnected)) {
                // Game is in progress and the player chooses the name of a disconnected player
                res.sendStatus(200);
            } else {
                // Player tries to join a game they weren't previously a part of 
                res.sendStatus(404);
            }
            break;
        default:
            res.sendStatus(404);  
    }
});

router.post('/expansionPack', async function(req, res) {
    const pack = new Deck(req.body);
    console.log("Recieved pack of cards: ", pack);
    try {
        await cards.saveExpansionPack(pack);
    } catch (e) {
        const message = (e && e.message || e) + "";
        if (message.startsWith("Pack already exists")) {
            console.error(message);
            res.sendStatus(400);
        } else {
            console.error(e);
            res.sendStatus(500);
        }
        return;
    }
    res.sendStatus(200);
});

// If there is an "api" url that doesn't match the above, send a 404 (not found)
router.use('*', async function(req, res) {
    res.sendStatus(404);
});

module.exports = router;