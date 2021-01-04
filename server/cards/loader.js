var fs = require('fs');
var path = require('path');
var builtInDecks = require('./system-decks.json');
var builtInExpansions = require('./system-expansion-packs.json');

/* Custom (user-added) expansion packs are defined in a file called 'custom-cards.json'.
 *
 * When the user starts a new game, the entries in this file are displayed.
 * 
 * This file is created when the player saves their first custom expansion pack.
 * If this file already exists, the new pack is appended to the existing file.
 * If this file exists but has invalid contents, it will be overwritten.
 * 
 * When running the game from source, custom-cards.json should be in '/server/cards',
 * next to system-decks.json and system-expansion-packs.json. When running from a 
 * bundle, custom-cards.json should be in the same directory as the bundle.
 */

var isBundle = /^([a-z]:\\snapshot|\/snapshot).*/i.test(__dirname);
var userExpansionLocation = isBundle ? path.dirname(process.execPath) : __dirname;

// Get the list of user-installed expansion packs from ./custom-cards.json
// We can't just do a require() because this list may be updated while the game is running
function _getUserExpansions() {
    return new Promise(resolve => {
        fs.readFile(path.join(userExpansionLocation, 'custom-cards.json'), 'utf8', (err, data) => {
            if (err || !_formCheck(data)) {
                resolve([]);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

// Write a list of user-installed expansion packs to ./custom-cards.json
function _setUserExpansions(content) {
    return new Promise(resolve => {
        fs.writeFile(path.join(userExpansionLocation, 'custom-cards.json'), JSON.stringify(content), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function _formCheck(customCardsJson) {
    try {
        const packs = JSON.parse(customCardsJson);
        for (const pack of packs) {
            if (!(Object.keys(pack).length === 3 && typeof pack.name === "string" && Array.isArray(pack.prompts) && Array.isArray(pack.responses))) {
                return false;
            }
        }
        return true;
    } catch (e) {
        return false;
    }
}


// Just return built-ins. Change this if we want the users to be able to add base decks in addition to expansion packs.
async function getDecks() {
    return builtInDecks;
}

// Get a list of all available expansion packs. Returns both the built-ins and any user-created ones.
async function getExpansionPacks() {
    const userExpansions = await _getUserExpansions();
    return builtInExpansions.concat(userExpansions);
}

// Gets the currently available user-created expansion packs, performs some checks, then adds a new one.
async function saveExpansionPack(newPack) {
    const userExpansions = await _getUserExpansions();

    // Make sure a pack with this name doesn't already exist
    const expansionNames = builtInExpansions.concat(userExpansions).map(pack => pack.name);
    if (expansionNames.includes(newPack.name)) {
        throw new Error("Pack already exists: " + newPack.name);
    }

    // Update user expansion pack file (will throw/reject on failure)
    userExpansions.push(newPack);
    await _setUserExpansions(userExpansions);
}

module.exports = { getDecks, getExpansionPacks, saveExpansionPack }