const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const players = {}; // Store players' data
let streamingPlayerId = null;

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Add new player to the list with initial position
    players[socket.id] = { position: { x: 0, y: 1.6, z: 0 } };

    // Assign the streaming role to the first player who connects
    if (!streamingPlayerId) {
        streamingPlayerId = socket.id;
    }

    // Notify all clients of the current streaming player
    io.emit('setStreamingPlayer', streamingPlayerId);

    // Send the list of current players to the newly connected player
    socket.emit('currentPlayers', players);

    // Notify others of the new player
    socket.broadcast.emit('newPlayer', { id: socket.id, position: players[socket.id].position });

    // Handle movement updates from the player
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].position = data.position; // Update position on server
            socket.broadcast.emit('move', { id: socket.id, position: data.position }); // Broadcast to others
        }
    });

    // Handle stream from the streaming player
    socket.on('stream', (stream) => {
        console.log(`Stream received from player: ${socket.id}`); // Log when a stream is received
        // Broadcast the stream to all other clients
        socket.broadcast.emit('stream', { id: socket.id, stream });
        console.log(`Broadcasting stream from player: ${socket.id}`); // Log when the stream is broadcasted
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('removePlayer', socket.id);

        // If the streaming player disconnected, reassign streaming to another player if possible
        if (socket.id === streamingPlayerId) {
            streamingPlayerId = null; // Clear the streaming player ID

            // Reassign to another player if there are any left
            const remainingPlayerIds = Object.keys(players);
            if (remainingPlayerIds.length > 0) {
                streamingPlayerId = remainingPlayerIds[0];
                io.emit('setStreamingPlayer', streamingPlayerId); // Notify clients of the new streaming player
            } else {
                io.emit('streamingPlayerLeft'); // Inform clients that there's no streaming player
            }

            console.log('Streaming player left or reassigned');
        }
    });
});

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Listen on the appropriate port (use the port from the environment variable)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
