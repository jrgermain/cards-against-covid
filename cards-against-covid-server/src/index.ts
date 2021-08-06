import chalk from "chalk";
import ip from "ip";
import WebSocket, { Server } from "ws";
import * as connections from "./state/connections";
import Connection from "./domain/Connection";
import { port } from "./config";

const server = new Server({ port });

server.on("connection", (socket: WebSocket) => {
    connections.add(new Connection(socket));
});

console.log(`Join the game at ${chalk.bold(`http://${ip.address()}:${port}`)}`);
console.log("By default, this link will only work for people on the same network as you. For more information, or help joining, check out the Cards Against COVID wiki here: https://github.com/jrgermain/cards-against-covid/wiki");
