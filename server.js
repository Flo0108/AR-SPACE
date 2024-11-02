const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let streamId = null; // To keep track of the first player's stream ID

io.on('connection', (socket) => {
    console.log('A player connected: ' + socket.id);

    // Listen for video stream from the first player
    socket.on('video-stream', (data) => {
        if (!streamId) {
            streamId = socket.id; // Set the first player's ID
            console.log('Stream received from player: ' + streamId);
        }
        // Broadcast to all clients except the sender
        socket.broadcast.emit('video-stream', data);
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
        if (socket.id === streamId) {
            streamId = null; // Reset the stream ID if the first player disconnects
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
