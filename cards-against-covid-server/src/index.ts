import chalk from "chalk";
import ip from "ip";
import WebSocket, { Server } from "ws";
import http from "http";
import path from "path";
import * as fs from "fs";
import * as connections from "./state/connections";
import Connection from "./domain/Connection";
import { isBundle, port } from "./config";

const server = new Server({ port });

server.on("connection", (socket: WebSocket) => {
    connections.add(new Connection(socket));
});

if (isBundle) {
    const clientRoot = path.resolve(__dirname, "../../cards-against-covid-client/build");
    const reactApp = fs.readFileSync(path.join(clientRoot, "index.html"));

    new http.Server((req, res) => {
        if (!req.url) {
            return;
        }
        fs.readFile(path.join(clientRoot, req.url), (err, data) => {
            if (err) {
                res.write(reactApp);
            } else {
                res.write(data);
            }
            res.end();
        });
    }).listen(3000);
}

console.log(`Join the game at ${chalk.bold(`http://${ip.address()}:${port}`)}`);
console.log("By default, this link will only work for people on the same network as you. For more information, or help joining, check out the Cards Against COVID wiki here: https://github.com/jrgermain/cards-against-covid/wiki");
