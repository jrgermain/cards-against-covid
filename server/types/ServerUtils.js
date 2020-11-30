// Gracefully shuts down an http server
function shutDown(server, timeout) {
    console.log('Shutting down');

    server.close(() => {
        console.log('Game server shut down successfully');
        process.exit(0);
    });

    setTimeout(() => {
        console.error(`Game server shut down after reaching ${timeout / 1000} second timeout`);
        process.exit(1);
    }, timeout);
}

module.exports = { shutDown };