import type Connection from "../domain/Connection";

const connections = new Map<string, Connection>();

function addConnection(connection: Connection) {
    connections.set(connection.id, connection);
}

function removeConnection(connection: Connection, terminate = false) {
    if (terminate && connection.isActive) {
        connection.end();
    }
    connections.delete(connection.id);
}

function getConnectionById(connectionId: string) {
    return connections.get(connectionId);
}

function listConnections() {
    return Array.from(connections.keys());
}

export {
    addConnection as add,
    removeConnection as remove,
    getConnectionById as get,
    listConnections as list,
};
