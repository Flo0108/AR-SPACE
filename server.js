const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const players = {};
const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Assign a random name to the player
    const randomName = playerNames[Math.floor(Math.random() * playerNames.length)];
    players[socket.id] = { position: { x: 0, y: 1.6, z: 0 }, name: randomName };

    // Send current players to the new player
    socket.emit('currentPlayers', players);

    // Notify other players about the new player
    socket.broadcast.emit('newPlayer', { id: socket.id, position: players[socket.id].position, name: randomName });

    // Update player's position on movement
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].position = data.position;
            socket.broadcast.emit('move', { id: socket.id, position: data.position });
        }
    });

    // Receive closest player information from client
    socket.on('closestPlayer', (data) => {
        if (players[socket.id]) {
            // You can store closest player info in players object
            players[socket.id].closestPoint = data.closestPoint;
            players[socket.id].closestDistance = data.closestDistance;

            // Notify other players about the closest player info
            socket.broadcast.emit('closestPlayerUpdate', { id: socket.id, closestPoint: data.closestPoint, closestDistance: data.closestDistance });
        }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnected', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
