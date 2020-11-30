# Cards Against COVID
*A party game for quarantined people*

This is [Amanda Etienne](https://github.com/ajetienne)'s and my senior project for our Computer Science degree at QU. Our project is inspired by Cards Against Humanity, a party game in which players complete fill-in-the-blank statements using phrases printed on playing cards. This game is popular among college students, but since we are now living in a pandemic, it is hard to safely play it with friends. We want to give people a new way to have fun and play a game they love while remaining socially distant.

We have decided to make a webapp that adapts the gameplay of Cards Against Humanity into a format that can be played on any computer or smartphone. In addition to mimicking the gameplay of the popular card game, we are planning on adding text chat, multiple card decks, custom expansion packs, and a responsive UI that will work on different screen sizes.

# Building and running
## Prerequisites
1. You must have Node.js installed. For directions, see [How to install Node.js](https://nodejs.dev/learn/how-to-install-nodejs).
2. Make sure to install all dependencies to the project by running `npm install` inside the project directory.
3. If you want to create executables that include node and the dependencies, install [pkg](https://www.npmjs.com/package/pkg) by running `npm install -g pkg`.

## Running from source
1. Navigate to the project directory (the folder should be named 'cards-against-covid')
2. Run the following command: `npm start`

## Building an executable
1. Navigate to the project directory (the folder should be named 'cards-against-covid')
2. Run the following command: `npm run build`
3. Executables should now be in a subfolder called 'build', which will be created if it doesn't already exist