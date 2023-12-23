const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const redis = require('redis');
const redisAdapter = require('socket.io-redis');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const redisClient = redis.createClient();

// Express middleware for JSON parsing
app.use(express.json());

// JWT secret key
const secretKey = 'your-secret-key';

// Sample user data (replace with a database in a real-world scenario)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

// Authenticate user and generate JWT
function authenticateUser(username, password) {
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    return token;
  }
  return null;
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle messages
  socket.on('message', (data) => {
    // Broadcast the message to all connected clients
    io.emit('message', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Express route for user authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const token = authenticateUser(username, password);

  if (token) {
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
