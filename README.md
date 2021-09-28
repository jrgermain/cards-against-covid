# Cards Against COVID
*A party game for quarantined people*

## Project overview
This is [Amanda Etienne](https://github.com/ajetienne)'s and my senior project for our Computer Science degree at QU. Our project is inspired by Cards Against Humanity, a party game in which players complete fill-in-the-blank statements using phrases printed on playing cards. This game is popular among college students, but since we are now living in a pandemic, it is hard to safely play it with friends. We want to give people a new way to have fun and play a game they love while remaining socially distant.

We have decided to make a webapp that adapts the gameplay of Cards Against Humanity into a format that can be played on any computer or smartphone. In addition to mimicking the gameplay of the popular card game, we added text chat, multiple card decks, custom expansion packs, and a responsive UI that works on different screen sizes.

## Project architecture
The game has two main components: a React-based frontend (cards-against-covid-client) and a Node-based backend (cards-against-covid-server). The two pieces work together to form a client-server application in which clients connect through a web browser.

## Project status
The game is still being maintained, but development is moving slower now that I graduated and am working full time. To track development progress, check out the Projects link at the top of the repository.

## Building and running the server
### Prerequisites
1. You must have Node.js (version 14.17 or later) and npm (included with Node.js) installed. For directions, see [How to install Node.js](https://nodejs.dev/learn/how-to-install-nodejs).
2. Make sure to install all of the project's dependencies by running `npm install` in both the 'cards-against-covid-client' and 'cards-against-covid-server' subfolders

### Running from source (dev mode)
This mode allows you to run the game using your local copy of the source code. On the client side, it enables live reload and uses the development version of React. On the server side, more verbose logging is enabled to aid in debugging. To access the game, open http://localhost:3000 in your web browser. Port 3000 is used to host the client. Meanwhile, port 8080 is used by the backend.

1. In a terminal window, navigate to the 'cards-against-covid-server' directory and run `npm start` (run `npm install` first, if you haven't already)
2. In a second terminal window, navigate to the 'cards-against-covid-client' directory and run `npm start` (run `npm install` first, if you haven't already)
    - A web browser window should open automatically

### Building executables (production mode)
This mode bundles everything needed to run the game into a single executable file. On the client side, the production version of React is used and the code is compiled to plain HTML, JavaScript, and CSS. On the server side, fewer messages are logged. 

1. Navigate to the 'cards-against-covid-bundle' directory.
2. Before your first build, run `npm install`. *NOTE: You only need to do this the first time.*
3. Run the following command: `npm run full-build`.
4. Executables for macOS, Windows, and Linux should now be in a subfolder called 'dist', which will be created if it doesn't already exist.

#### Running production mode executables
The executable files built in the previous step should start up a game server when double-clicked. You can also run the app through the command line (e.g. by running `dist/Cards-Against-COVID-linux` from the 'cards-against-covid-bundle' directory on a linux machine).
