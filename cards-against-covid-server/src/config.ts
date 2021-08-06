// TODO: Use a library to parse out arguments, and possibly support a .env file
const args = process.argv.slice(2);
const isDev = args.includes("--dev");
const port = 8080; // TODO: remove hard-coding of port

// The user is running from a bundle if the current directory is in '/snapshot' or 'C:\snapshot'
const isBundle = /^([a-z]:\\snapshot|\/snapshot).*/i.test(__dirname);

export { port, isDev, isBundle };
