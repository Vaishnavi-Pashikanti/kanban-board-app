const Task = require('../models/Task');
const User = require('../models/User');
const Log = require('../models/Log');

// Helper to emit activity log
const emitLog = async (req, message, taskId = null) => {
  const user = await User.findById(req.user.id);
  const logEntry = {
    user: user.name,
    action: message,
    task: taskId,
    timestamp: new Date(),
  };
  await Log.create(logEntry);
  req.io.emit('log', logEntry);
};

exports.createTask = async (req, res) => {
  const { title, status } = req.body;
  const invalidTitles = ['todo', 'in progress', 'done'];

  try {
    // Normalize input
    const titleLower = title.toLowerCase();

    // Check if title is a column name
    if (invalidTitles.includes(titleLower)) {
      return res.status(400).json({ message: 'Task title cannot match column names' });
    }

    // Check uniqueness within the same status
    const exists = await Task.findOne({ title, status });
    if (exists) {
      return res.status(400).json({ message: 'Task title must be unique within the column' });
    }

    const task = await Task.create({ ...req.body, createdBy: req.user.id });
    req.io.emit('task', { type: 'create', task });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task' });
  }
};


exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const incoming = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Conflict Detection
    const clientTimestamp = new Date(incoming.updatedAt).getTime();
    const serverTimestamp = new Date(task.updatedAt).getTime();

    if (clientTimestamp < serverTimestamp) {
      // Conflict detected
      return res.status(409).json({
        message: 'Conflict detected: This task was modified by another user.',
        conflict: {
          serverVersion: task,
          clientVersion: incoming,
        },
      });
    }

    const updated = await Task.findByIdAndUpdate(taskId, incoming, { new: true });

    req.io.emit('task', { type: 'update', task: updated });

    await Log.create({
      user: req.user.id,
      action: `Updated task: ${updated.title}`,
      task: updated._id,
      timestamp: new Date()
    });

    req.io.emit('log', {
      user: req.user.id,
      action: `Updated task: ${updated.title}`,
      timestamp: new Date()
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task' });
  }
};



exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    req.io.emit('task', { type: 'delete', taskId: req.params.id });

    await emitLog(req, `Deleted task: ${task.title}`, task._id);

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task' });
  }
};

exports.smartAssign = async (req, res) => {
  try {
    const users = await User.find();
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({
          assignedTo: user._id,
          status: { $in: ['Todo', 'In Progress'] },
        });
        return { user, count };
      })
    );

    const { user: leastBusyUser } = userTaskCounts.reduce((a, b) =>
      a.count <= b.count ? a : b
    );

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: leastBusyUser._id },
      { new: true }
    );

    req.io.emit('task', { type: 'update', task });

    await emitLog(req, `Smart assigned to ${leastBusyUser.name}`, task._id);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Smart Assign failed', error: err.message });
  }
};
