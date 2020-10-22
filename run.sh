#!/bin/sh

# Build the react app
cd ./client
npm run build 

# Run the server
cd ../server
npm start

# Go back to the starting point
cd ..
