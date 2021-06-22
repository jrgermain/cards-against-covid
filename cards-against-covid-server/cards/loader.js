const fs = require("fs");
const path = require("path");
const builtInDecks = require("./system-decks.json");
const builtInExpansions = require("./system-expansion-packs.json");

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

// The user is running from a bundle if the current directory is in '/snapshot' or 'C:\snapshot'
const isBundle = /^([a-z]:\\snapshot|\/snapshot).*/i.test(__dirname);
const userExpansionFile = path.join(isBundle ? path.dirname(process.execPath) : __dirname, "custom-cards.json");

/* Form check for a custom card file. It should contain an array of objects with these fields:
 *   name: string
 *   prompts: array (required but may be empty)
 *   responses: array (required but may be empty)
 */
function formCheck(customCardsJson) {
    try {
        const packs = JSON.parse(customCardsJson);
        return packs.every((pack) => typeof pack.name === "string" && Array.isArray(pack.prompts) && Array.isArray(pack.responses));
    } catch (e) {
        return false;
    }
}

// Get the list of user-installed expansion packs from ./custom-cards.json
// We can't just do a require() because this list may be updated while the game is running
function getUserExpansions() {
    return new Promise((resolve) => {
        fs.readFile(userExpansionFile, "utf8", (err, data) => {
            if (err || !formCheck(data)) {
                resolve([]);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

// Write a list of user-installed expansion packs to ./custom-cards.json
function setUserExpansions(content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(userExpansionFile, JSON.stringify(content), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Just return built-in decks. Change this if we want the users to be able to create entire decks.
async function getDecks() {
    return builtInDecks;
}

// Get a list of all available expansion packs. Returns both the built-in and user-created ones.
async function getExpansionPacks() {
    const userExpansions = await getUserExpansions();
    return builtInExpansions.concat(userExpansions);
}

// Looks at user-created expansion packs, performs some checks, then adds a new one.
async function saveExpansionPack(newPack) {
    const userExpansions = await getUserExpansions();

    // Make sure a pack with this name doesn't already exist
    const expansionNames = builtInExpansions.concat(userExpansions).map((pack) => pack.name);
    if (expansionNames.includes(newPack.name)) {
        throw new Error(`Pack already exists: ${newPack.name}`);
    }

    // Update user expansion pack file (will throw/reject on failure)
    userExpansions.push(newPack);
    await setUserExpansions(userExpansions);
}

module.exports = { getDecks, getExpansionPacks, saveExpansionPack };
