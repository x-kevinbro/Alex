const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server);

// Serve static files from the 'public' directory if it exists
// In case you have a public folder (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html from the root directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // If your index.html is in the root directory
});

// Handle incoming connections via Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Listening for messages from the client
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Emit the message to all clients
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// MongoDB connection
const mongoURI = process.env.MONGO_URI; // Using environment variable for Mongo URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Fallback route for single-page app (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Set the port for the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('Server running on port ' + PORT); // Fixed the interpolation error
});
