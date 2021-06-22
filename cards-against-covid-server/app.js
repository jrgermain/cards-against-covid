const express = require("express");
const { Server } = require("http");
const path = require("path");
const logger = require("morgan");
const ip = require("ip");
const chalk = require("chalk");
const stoppable = require("stoppable");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const apiRouter = require("./logic/api");
const setupSocket = require("./logic/socket");

const app = express();
const args = process.argv.slice(2);
const isDev = args.includes("--dev");
const PORT = 8080;

// Setup http server
const server = new Server(app);
stoppable(server, 5000);
server.listen(PORT);
process.on("SIGTERM", () => server.stop());
process.on("SIGINT", () => server.stop());

// Setup the express app
if (isDev) {
    app.use(logger("dev"));
    app.use(cors());
}
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup routing: if the request url starts with /api, send it to the API router
app.use("/api", apiRouter);

// Setup routing: direct all other requests to the React app
if (isDev) {
    // The react app is running on port 3000, so proxy to that port
    app.use("*", createProxyMiddleware({
        target: "http://localhost:3000",
        ws: false,
        logLevel: "debug",
    }));
} else {
    // The react app was compiled, so point to the files
    app.use(express.static(path.join(__dirname, "/../cards-against-covid-client/build")));
    app.use("*", (req, res) => {
        res.sendFile(path.join(__dirname, "/../cards-against-covid-client/build", "index.html"));
    });
}

// Setup socket functionality
setupSocket(server);

// Print welcome message to users
if (!isDev) {
    console.log(`Join the game at ${chalk.bold(`http://${ip.address()}:${PORT}`)}`);
    console.log("By default, this link will only work for people on the same network as you. For more information, or help joining, check out the Cards Against COVID wiki here: https://github.com/jrgermain/cards-against-covid/wiki");
}
