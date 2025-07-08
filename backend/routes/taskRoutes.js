const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  smartAssign
} = require('../controllers/taskController');

router.post('/', auth, createTask);
router.get('/', auth, getTasks);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);
router.put('/smart-assign/:id', auth, smartAssign);

module.exports = router;
