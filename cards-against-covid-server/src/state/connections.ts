import type Connection from "../domain/Connection";

const connections = new Map<string, Connection>();

function addConnection(connection: Connection): void {
    connections.set(connection.id, connection);
}

function removeConnection(connection: Connection, terminate = false): void {
    if (terminate && connection.isActive) {
        connection.end();
    }
    connections.delete(connection.id);
}

function getConnectionById(connectionId: string): Connection | undefined {
    return connections.get(connectionId);
}

function listConnections(): string[] {
    return Array.from(connections.keys());
}

export {
    addConnection as add,
    removeConnection as remove,
    getConnectionById as get,
    listConnections as list,
};
