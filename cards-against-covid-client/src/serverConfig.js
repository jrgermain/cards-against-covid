import { io } from "socket.io-client";

const address = `http://${window.location.hostname}:8080`;
// const socket = io(address, { transports: ["websocket", "polling"] });
const socket = io(address, { transports: ["websocket"] });

export { socket, address };
