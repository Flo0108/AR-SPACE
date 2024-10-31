// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

let players = {};

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Add new player to the list
    players[socket.id] = { position: { x: 0, y: 1.6, z: 0 } };  // initial position

    // Send current players to the new player
    socket.emit('currentPlayers', players);

    // Notify others of new player
    socket.broadcast.emit('newPlayer', { id: socket.id, position: players[socket.id].position });

    // Handle movement updates
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].position = data.position; // Update position on server
            socket.broadcast.emit('move', { id: socket.id, position: data.position }); // Broadcast to others
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('removePlayer', socket.id);
    });
});

// Listen on the appropriate port (use the port from the environment variable)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
