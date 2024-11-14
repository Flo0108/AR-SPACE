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

const playerScores = { point1: 0, point2: 0, point3: 0 }



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
                supportPoint, // Their new support point
                playerScores // total rounds score
            };

            // Send the data to the specific player who moved
            socket.emit('supportPointUpdate', supportData);

            // Broadcast the update to all other players
            socket.broadcast.emit('supportPointUpdate', supportData);

        }
    });



    // Handle updates from players about their support point
    socket.on('updateSupportPoint1', (data) => {
        const { playerId, supportPoint } = data;
        const previousPoint = playerSupportPoints[playerId];

        

        if (previousPoint !== supportPoint) {
            // Decrement the count for the previous point
            if (previousPoint) {
                pointCountsRound0[previousPoint] = Math.max(pointCountsRound0[previousPoint] - 1, 0);
            }

            // Increment the count for the new support point
            pointCountsRound0[supportPoint] = (pointCountsRound0[supportPoint] || 0) + 1;

            // Update the player's current support point
            playerSupportPoints[playerId] = supportPoint;

            // Prepare the data to send back to the players
            const supportData = {
                pointCountsRound0, // Current count of players at each point
                playerId, // Player who triggered the update
                supportPoint, // Their new support point
                playerScores // total rounds score
            };

            console.log(pointCountsRound0)

            // Send the data to the specific player who moved
            socket.emit('supportPoint1Update', supportData);

            // Broadcast the update to all other players
            socket.broadcast.emit('supportPoint1Update', supportData);

        }
    });

    // Handle updates from players about their support point
    socket.on('updateSupportPoint2', (data) => {
        const { playerId, supportPoint } = data;
        const previousPoint = playerSupportPoints[playerId];

        

        if (previousPoint !== supportPoint) {
            // Decrement the count for the previous point
            if (previousPoint) {
                pointCountsRound0[previousPoint] = Math.max(pointCountsRound0[previousPoint] - 1, 0);
            }

            // Increment the count for the new support point
            pointCountsRound0[supportPoint] = (pointCountsRound0[supportPoint] || 0) + 1;

            // Update the player's current support point
            playerSupportPoints[playerId] = supportPoint;

            // Prepare the data to send back to the players
            const supportData = {
                pointCountsRound0, // Current count of players at each point
                playerId, // Player who triggered the update
                supportPoint, // Their new support point
                playerScores // total rounds score
            };

            console.log(pointCountsRound0)

            // Send the data to the specific player who moved
            socket.emit('supportPoint2Update', supportData);

            // Broadcast the update to all other players
            socket.broadcast.emit('supportPoint2Update', supportData);

        }
    });

    // Handle updates from players about their support point
    socket.on('updateSupportPoint3', (data) => {
        const { playerId, supportPoint } = data;
        const previousPoint = playerSupportPoints[playerId];

        

        if (previousPoint !== supportPoint) {
            // Decrement the count for the previous point
            if (previousPoint) {
                pointCountsRound0[previousPoint] = Math.max(pointCountsRound0[previousPoint] - 1, 0);
            }

            // Increment the count for the new support point
            pointCountsRound0[supportPoint] = (pointCountsRound0[supportPoint] || 0) + 1;

            // Update the player's current support point
            playerSupportPoints[playerId] = supportPoint;

            // Prepare the data to send back to the players
            const supportData = {
                pointCountsRound0, // Current count of players at each point
                playerId, // Player who triggered the update
                supportPoint, // Their new support point
                playerScores // total rounds score
            };

            console.log(pointCountsRound0)

            // Send the data to the specific player who moved
            socket.emit('supportPoint3Update', supportData);

            // Broadcast the update to all other players
            socket.broadcast.emit('supportPoint3Update', supportData);

        }
    });


    // When the visibility is toggled
    socket.on('endRound', () => {
        console.log(pointCounts);

        // Find the player with the highest count
        let highestPlayer = null;
        let highestCount = -1;

        for (const [point, count] of Object.entries(pointCounts)) {
            if (count > highestCount) {
                highestCount = count;
                highestPlayer = point;
            }
        }

        // Increment the score for the player with the highest count
        if (highestPlayer && playerScores.hasOwnProperty(highestPlayer)) {
            playerScores[highestPlayer] += 1;
        }

        // Broadcast to all clients to sync the visibility
        socket.broadcast.emit('roundEnded');

        console.log(`Updated playerScores:`, playerScores);
    });


    // Listen for the "endGame" event to reset scores
    socket.on('activateRound0_0', () => {
        pointCountsRound0 = { point5: 0, point6: 0}
        socket.emit('round0_0Activated');
        socket.broadcast.emit('round0_0Activated');
    });

    // Listen for the "endGame" event to reset scores
    socket.on('activateRound0_1', () => {
        pointCountsRound0 = { point5: 0, point6: 0}
        socket.emit('round0_1Activated');
        socket.broadcast.emit('round0_1Activated');
    });

    // Listen for the "endGame" event to reset scores
    socket.on('activateRound0_2', () => {
        pointCountsRound0 = { point5: 0, point6: 0}
        socket.emit('round0_2Activated');
        socket.broadcast.emit('round0_2Activated');
    });


    // Listen for the "endGame" event to reset scores
    socket.on('endGame', () => {
        // Reset each player's score to 0
        for (const key in playerScores) {
            playerScores[key] = 0;
        }

        for (const key in pointCounts) {
            pointCounts[key] = 0;
        }

        // Log the reset playerScores to confirm
        console.log('Game ended, playerScores reset:', playerScores);

        // Optionally, broadcast the reset scores to all clients
        socket.emit('playerScoresReset', playerScores);
    });

    // When the visibility is toggled
    socket.on('toggleModelVisibility', (newVisibility) => {
        // Broadcast to self to sync the visibility
        socket.emit('toggleModelVisibility', newVisibility);
        // Broadcast to all clients to sync the visibility
        socket.broadcast.emit('toggleModelVisibility', newVisibility);
    });

    // When the visibility is toggled
    socket.on('toggleModelVisibility2', (newVisibility) => {

        socket.emit('toggleModelVisibility2', newVisibility);

        // Broadcast to all clients to sync the visibility
        socket.broadcast.emit('toggleModelVisibility2', newVisibility);
    });

    // When the message should be shown
    socket.on('showVoteMessage', () => {
        socket.broadcast.emit('showVoteMessage');
    });

    // When the message should be hidden
    socket.on('hideVoteMessage', () => {
        socket.broadcast.emit('hideVoteMessage');
    });

    // When the message should be shown
    socket.on('showVoteMessage2', () => {
        socket.broadcast.emit('showVoteMessage2');
    });

    // When the message should be hidden
    socket.on('hideVoteMessage2', () => {
        socket.broadcast.emit('hideVoteMessage2');
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
