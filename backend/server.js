const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Allowed frontend URLs
const allowedOrigins = [
  'http://localhost:3000',
  'https://kanban-board-app-opal.vercel.app'
];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// ✅ Setup Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// ✅ Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ WebSocket connection handler
io.on('connection', (socket) => {
  console.log(`🟢 WebSocket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔴 WebSocket disconnected: ${socket.id}`);
  });
});

// ✅ Sample route to test server
app.get('/', (req, res) => {
  res.send('Kanban backend is running...');
});

// ✅ Your routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ✅ Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Mongo connection error:', err.message);
});
