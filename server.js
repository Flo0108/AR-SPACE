const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const players = {};
const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];
const playerSupportPoints = {}; // Store each player’s support point
const pointCounts = { point1: 0, point2: 0, point3: 0 }; // Initial counts for each point


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
    

    // Handle updates from players about their support point
    socket.on('updateSupportPoint', (data) => {
        const { playerId, supportPoint } = data;
        const previousPoint = playerSupportPoints[playerId];

        if (previousPoint !== supportPoint) {
            // Decrement the count for the previous point
            if (previousPoint) {
                pointCounts[previousPoint] = Math.max(pointCounts[previousPoint] - 1, 0);
            }

            // Increment the count for the new support point
            pointCounts[supportPoint] = (pointCounts[supportPoint] || 0) + 1;

            // Update the player's current support point
            playerSupportPoints[playerId] = supportPoint;

            // Prepare the data to send back to the players
            const supportData = {
                pointCounts, // Current count of players at each point
                playerId, // Player who triggered the update
                supportPoint // Their new support point
            };

            // Send the data to the specific player who moved
            socket.emit('supportPointUpdate', supportData);

            // Broadcast the update to all other players
            socket.broadcast.emit('supportPointUpdate', supportData);

            console.log(`Updated support counts:`, pointCounts);
        }
    });


    // When the visibility is toggled
    socket.on('toggleModelVisibility', (newVisibility) => {
        // Broadcast to all clients to sync the visibility
        socket.broadcast.emit('toggleModelVisibility', newVisibility);
    });

    // When the message should be shown
    socket.on('showVoteMessage', () => {
        socket.broadcast.emit('showVoteMessage');
    });

    // When the message should be hidden
    socket.on('hideVoteMessage', () => {
        socket.broadcast.emit('hideVoteMessage');
    });


    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        const supportPoint = playerSupportPoints[socket.id];
        if (supportPoint) {
            pointCounts[supportPoint] = Math.max(pointCounts[supportPoint] - 1, 0);
        }
        delete playerSupportPoints[socket.id];
        socket.broadcast.emit('playerDisconnected', socket.id);
    });
});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
