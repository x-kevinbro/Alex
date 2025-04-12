const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection URI
const dbURI = 'mongodb+srv://Mralexid:Alex123@cluster0.sgp6phr.mongodb.net/';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Error connecting to MongoDB:", err));

// Message Schema for MongoDB
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Serve static files from 'public' folder
app.use(express.static('public'));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for chat messages and save them to MongoDB
  socket.on('chat message', (msg) => {
    const newMessage = new Message({
      username: msg.username,
      message: msg.message
    });

    newMessage.save()
      .then(() => {
        io.emit('chat message', msg); // Broadcast message to all users
      })
      .catch(err => console.log("Error saving message:", err));
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
