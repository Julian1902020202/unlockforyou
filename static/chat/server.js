const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

require('dotenv').config(); // Importieren von dotenv für Umgebungsvariablen

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // Verwenden der Umgebungsvariablen für die MongoDB-Verbindung
const JWT_SECRET = process.env.JWT_SECRET; // Verwenden der Umgebungsvariablen für das JWT-Geheimnis

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Statische Dateien bedienen

// MongoDB Connection
mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

app.get('/profile', authMiddleware, (req, res) => {
  res.json({ username: req.user.username });
});

// Socket.io
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.user.username);

  socket.on('join', (room) => {
    socket.join(room);
    console.log(`${socket.user.username} joined room ${room}`);
  });

  socket.on('message', (data) => {
    const { room, message } = data;
    io.to(room).emit('message', { user: socket.user.username, message });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.user.username);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
