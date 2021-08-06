import fs from "fs/promises";
import path from "path";
import systemDecksJson from "./system-decks.json";
import systemExpansionPacksJson from "./system-expansion-packs.json";
import Deck from "../domain/Deck";
import { isBundle } from "../config";

/* Custom (user-added) expansion packs are defined in a file called 'custom-cards.json'.
 *
 * When the user starts a new game, the entries in this file are displayed alongside the game's
 * built-in expansion packs.
 *
 * - This file is created when the player saves their first custom expansion pack.
 * - If this file already exists, new packs are appended to the existing file.
 * - If this file exists but has invalid contents, it will be overwritten.
 *
 * custom-cards.json should be stored in the following location:
 * - Running from source: cards-against-covid-server/src/cards
 * - Running from build: next to the running executable
 */

const userExpansionDir = isBundle ? path.dirname(process.execPath) : __dirname;
const userExpansionFile = path.join(userExpansionDir, "custom-cards.json");

// Convert JSON into "Deck" domain objects
const systemDecks = systemDecksJson.map((e) => new Deck(e));
const systemExpansionPacks = systemExpansionPacksJson.map((e) => new Deck(e));

// Get the list of user-installed expansion packs from custom-cards.json (may change at any time)
async function getUserExpansionPacks(): Promise<Deck[]> {
    let fileContent;
    try {
        const fileText = await fs.readFile(userExpansionFile, "utf8");
        fileContent = JSON.parse(fileText);
    } catch (e) {
        return [];
    }

    // Check if the file is a JSON array of objects that conform to the Deck interface (IDeck)
    if (Array.isArray(fileContent) && fileContent.every((item: any) => Deck.isIDeck(item))) {
        // Convert to deck objects
        return fileContent.map((iDeck) => new Deck(iDeck));
    }

    return [];
}

// Get a list of all available expansion packs. Returns both the built-in and user-created ones.
async function getExpansionPacks(): Promise<Deck[]> {
    const userExpansionPacks = await getUserExpansionPacks();
    return [...systemExpansionPacks, ...userExpansionPacks];
}

// Get a list of all available decks. Provided for consistency with getExpansionPacks.
async function getDecks(): Promise<Deck[]> {
    return systemDecks;
}

// Looks at user-created expansion packs, performs some checks, then adds a new one.
async function saveExpansionPack(newPack: Deck): Promise<void> {
    // Make sure a pack with this name doesn't already exist
    const allPacks = await getExpansionPacks();
    if (allPacks.some((pack) => pack.name.trim() === newPack.name.trim())) {
        throw new Error(`Pack already exists: ${newPack.name}`);
    }

    // Update user expansion pack file (will throw/reject on failure)
    const userExpansionPacks = await getUserExpansionPacks();
    userExpansionPacks.push(newPack);

    try {
        // TODO: race conditions?
        fs.writeFile(userExpansionFile, JSON.stringify(userExpansionPacks));
    } catch (e) {
        // Replace with a user-friendly error message
        console.error(e);
        throw new Error("There was an error saving the expansion pack");
    }
}

export { getDecks, getExpansionPacks, saveExpansionPack };
