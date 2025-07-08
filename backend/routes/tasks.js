// === /backend/routes/taskRoutes.js ===
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  smartAssign, // <-- add this
} = require('../controllers/taskController');

// Protected routes
router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

// 🔁 Smart Assign route
router.put('/:id/smart-assign', protect, smartAssign);

module.exports = router;
