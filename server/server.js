const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect('mongodb+srv://Mralexid:Alex123@cluster0.sgp6phr.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Chat schema
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../public')));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send chat history
  Message.find().sort({ timestamp: 1 }).limit(50).then(messages => {
    socket.emit('chat history', messages);
  });

  // Receive message
  socket.on('chat message', (data) => {
    const newMessage = new Message({
      username: data.username,
      message: data.message
    });

    newMessage.save().then(() => {
      io.emit('chat message', newMessage); // Broadcast to all clients
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
