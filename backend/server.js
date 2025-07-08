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

// ✅ Use CORS for frontend domain (support both local and production)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app', // 👈 update to your real frontend URL on Vercel
  ],
  credentials: true
}));
app.use(express.json());

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://kanban-board-app-opal.vercel.app', // 👈 update to your real frontend URL
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// ✅ Make io available inside routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Socket.IO listeners
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); // e.g. task updates should emit io events

// ✅ Start server after Mongo connection
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
