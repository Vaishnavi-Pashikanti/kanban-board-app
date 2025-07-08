const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // ✅ Add bcrypt for password comparison

// 🔐 Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// 👤 Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      user: { id: user._id, name: user.name, role: user.role },
      token
    });
  } catch (err) {
    console.error('Register error:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🔐 Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Compare plain password with hashed
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      user: { id: user._id, name: user.name, role: user.role },
      token
    });
  } catch (err) {
    console.error('Login error:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
