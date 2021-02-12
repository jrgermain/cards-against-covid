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

router.post('/startGame', async function(req, res) {
    const { deckName, expansionPacks } = req.body;

    const allDecks = await cards.getDecks();
    const allPacks = await cards.getExpansionPacks();
    const selectedDeck = allDecks.find(deck => deck.name === deckName);
    const filteredPacks = allPacks.filter(pack => expansionPacks.includes(pack.name));
    const combinedCards = [selectedDeck, ...filteredPacks].map(cards => new Deck(cards)).reduce(Deck.combine).shuffle();

    const code = Game.Code.generate(games);
    games[code] = new Game(combinedCards);
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
    } else if (game.players.some(player => player.name === name)) {
        console.warn(`Player "${name}" already exists in game "${code}".`);
        res.sendStatus(400);
    } else {
        res.sendStatus(200);
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