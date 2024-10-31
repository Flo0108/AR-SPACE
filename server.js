// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

// Object to keep track of players
let players = {};

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Add new player to the list with an initial position
    players[socket.id] = { x: 0, y: 1.6, z: 0 };  // Initial position in VR space

    // Send current players to the new player
    socket.emit('currentPlayers', players);

    // Notify others of the new player
    socket.broadcast.emit('newPlayer', { id: socket.id, position: players[socket.id] });

    // Listen for player movement updates
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id] = data; // Update player's position
            // Broadcast to all other clients
            socket.broadcast.emit('move', { id: socket.id, position: data });
        }
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        // Remove from players list
        delete players[socket.id];
        // Notify other clients to remove this player
        socket.broadcast.emit('removePlayer', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
