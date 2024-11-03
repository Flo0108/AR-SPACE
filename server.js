const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve your HTML and JS files
app.use(express.static('public')); // Adjust the directory as necessary

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);
    
    // Handle events
    socket.on('move', (data) => {
        // Handle move event
        socket.broadcast.emit('move', data);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
