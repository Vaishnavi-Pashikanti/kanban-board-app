const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins for frontend (both local & deployed)
const allowedOrigins = [
  'http://localhost:3000',
  'https://kanban-board-app-opal.vercel.app' // ✅ deployed frontend
];

// ✅ Middleware - CORS for REST API
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ✅ Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// ✅ Attach Socket.IO instance to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ✅ Start server after successful MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
