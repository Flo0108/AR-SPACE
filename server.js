const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// Store connected players and their names
let players = {};
const playerNames = ['Trump', 'Hillary', 'Biden'];
let nameIndex = 0; // To keep track of the next available name

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Assign a name to the player if available
    const playerName = playerNames[nameIndex % playerNames.length];
    players[socket.id] = { name: playerName, x: 0, y: 1.6, z: 0 }; // Add name to player data
    nameIndex++; // Move to the next name for the next player

    // Send current players to the new player
    socket.emit('currentPlayers', players);

    // Notify others of new player
    socket.broadcast.emit('newPlayer', { id: socket.id, name: playerName, position: players[socket.id] });

    // Handle movement updates
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id] = { ...players[socket.id], ...data }; // Update position without losing name
            socket.broadcast.emit('move', { id: socket.id, position: players[socket.id] });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('removePlayer', socket.id);
    });
});

// Use PORT environment variable or default to 3000
const PORT = process.env.PORT || 3000; 
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
