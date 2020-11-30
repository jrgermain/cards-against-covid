var fs = require('fs');
var path = require('path');
var sqlite = require('sqlite');
var sqlite3 = require('sqlite3');
var driver = sqlite3.Database;
var filename;

const snapshot = /^([a-z]:\\snapshot|\/snapshot).*/i;
if (snapshot.test(__dirname)) {
    /* We're running inside of the snapshot filesystem of a packaged executable.
     * This means we need to copy the database into the working directory.
     */
    const src = path.join(__dirname, '../db/game.db');
    const dest = path.join(path.dirname(process.execPath), 'game.db')
    if (!fs.existsSync(dest)) {
        console.log('Initializing card database');
        // fs.copyFileSync(src, dest); -- This doesn't work, so we have to read and write separately
        const gameDb = fs.readFileSync(src);
        fs.writeFileSync(dest, gameDb);
    }
    filename = dest;
} else {
    // We're running from source inside the regular filesystem
    filename = path.join(__dirname, '../db/game.db');
}

function connect() {
    return sqlite.open({ filename, driver });
}

module.exports = { connect }