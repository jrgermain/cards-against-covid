# Cards Against COVID
*A party game for quarantined people*

## Project overview
This is [Amanda Etienne](https://github.com/ajetienne)'s and my senior project for our Computer Science degree at QU. Our project is inspired by Cards Against Humanity, a party game in which players complete fill-in-the-blank statements using phrases printed on playing cards. This game is popular among college students, but since we are now living in a pandemic, it is hard to safely play it with friends. We want to give people a new way to have fun and play a game they love while remaining socially distant.

We have decided to make a webapp that adapts the gameplay of Cards Against Humanity into a format that can be played on any computer or smartphone. In addition to mimicking the gameplay of the popular card game, we added text chat, multiple card decks, custom expansion packs, and a responsive UI that works on different screen sizes.

## Project architecture
The game has two main components: a React-based frontend (cards-against-covid-client) and a Node- and Express-based backend (cards-against-covid-server). The two pieces work together to form a client-server application in which clients connect through a web browser.

### Aside: architecture plans
**Current status**: the client and server pieces can  run independently, but there is no provided mechanism to do so without editing the code.

**Next steps**: add configuration options so a user can host the client and server code on separate machines.

## Building and running the server
### Prerequisites
1. You must have Node.js (version 14 or later) and npm (included with Node.js) installed. For directions, see [How to install Node.js](https://nodejs.dev/learn/how-to-install-nodejs).
2. Make sure to install all of the project's dependencies by running `npm install` inside the root project directory (the folder named 'cards-against-covid'). *Note: this automatically installs the dependencies of both the `cards-against-covid-client` and `cards-against-covid-server` subprojects)*

### Running from source (dev mode)
This mode allows you to run the game using your local copy of the source code. On the client side, it enables live reload and uses the development version of React. On the server side, more verbose logging is enabled to aid in debugging. To access the game, open http://localhost:3000 in your web browser. Port 3000 is used to host the client. Meanwhile, port 8080 is used by the backend.

#### Method 1: run client and server in the same terminal
1. Open a terminal window and navigate to the root project directory (the folder named 'cards-against-covid').
2. Run the following command: `npm start`.
3. The client and server will both start up, and their output will be combined and displayed in the terminal.

#### Method 2: run both commands in separate terminals (recommended)
1. Open 2 terminal windows. In both windows, navigate to the root project directory (the folder named 'cards-against-covid').
2. In terminal 1, run `npm run server`. This will start the server and display its output in terminal 1.
3. In terminal 2, run `npm run client`. This will start the client and display its output in terminal 2.

### Building executables (production mode)
This mode bundles everything needed to run the game into a single executable file. On the client side, the production version of React is used and the code is compiled to plain HTML, JavaScript, and CSS. On the server side, fewer messages are logged, and an additional startup message is displayed. In production mode, both the client code and the server code are served at port 8080 (port 3000 is not used).

1. Navigate to the root project directory (the folder named 'cards-against-covid').
2. Run the following command: `npm run build`.
3. Executables for macOS, Windows, and Linux should now be in a subfolder called 'build', which will be created if it doesn't already exist.
