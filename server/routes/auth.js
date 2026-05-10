const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// const { sendWelcomeEmail } = require('../email/mailer');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({
        error: 'Username and password required'
      });

    const existing = await User.findOne({ username });

    if (existing)
      return res.status(400).json({
        error: 'Username already taken'
      });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hash
    });

    // Email temporarily disabled
    // await sendWelcomeEmail(username);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
      },
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user)
      return res.status(401).json({
        error: 'User not found'
      });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({
        error: 'Incorrect password'
      });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
      },
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// GET /api/auth/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username status lastSeen');

    res.json(users);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;