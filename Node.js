const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve your A-Frame HTML files from the 'public' directory

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Broadcast user position to all other clients
  socket.on('updatePosition', (data) => {
    socket.broadcast.emit('userMoved', { id: socket.id, position: data.position });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
