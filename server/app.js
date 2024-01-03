const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./src/config/db');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const chatRoomRoutes = require('./src/routes/chatRoomRoutes');

require('dotenv').config();

connectDB();
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

app.use(cors());

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/message', messageRoutes);
app.use('/chat-room', chatRoomRoutes);

const io = socketIo(server, {
  cors: {
    origin: 'http://client:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

let activeUsers = [];
const roomUsers = new Map();

io.on('connection', (socket) => {

  socket.on('addUser', (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id
      })
    }
    
    console.log(`${newUserId} joined. Online Users:`, activeUsers);
    io.emit('getUsers', activeUsers);
  });

  socket.on('joinRoom', (data) => {
    const { receiver } = data;
  
    socket.join(receiver);
    console.log(`User ${data.sender._id} joined room: ${receiver}`);
  
    if (!roomUsers.has(receiver)) {
      roomUsers.set(receiver, new Set());
    }
    roomUsers.get(receiver).add(data.sender._id);
  
    const currentUsers = Array.from(roomUsers.get(receiver)).map(userId => ({
      userId,
    }));
  
    io.to(receiver).emit('userJoinedRoom', { data: data, currentUsers: currentUsers });
    console.log(`${data.sender._id} joined ${receiver}. Online Users:`, currentUsers);
  });
  
  socket.on('leaveRoom', (data) => {
    const { receiver } = data;
  
    socket.leave(receiver);
    console.log(`User ${data.sender._id} left room: ${receiver}`);
  
    if (roomUsers.has(receiver)) {
      roomUsers.get(receiver).delete(data.sender._id);
  
      const currentUsers = Array.from(roomUsers.get(receiver)).map(userId => ({
        userId,
      }));
  
      io.to(receiver).emit('userLeftRoom', { data: data, currentUsers: currentUsers });
      console.log(`${data.sender._id} left ${receiver}. Online Users in room:`, currentUsers);
  
      if (roomUsers.get(receiver).size === 0) {
        roomUsers.delete(receiver);
      }
    }
  });
  

  socket.on('sendMessage', (data) => {
    console.log('Sent message', data);
    io.to(data.receiver).emit("getMessage", data);
    if(data.receiverType === 'User') {
      io.to(data.sender._id).emit("getMessage", data);
    }
  })

  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log(`Socket ${socket.id} disconnected. Online Users:`, activeUsers);

    io.emit('getUsers', activeUsers);

  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Mongo db ${process.env.MONGODB_URI}`);
});
