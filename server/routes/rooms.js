const router = require('express').Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// POST /api/rooms  — create a room
router.post('/', auth, async (req, res) => {
  try {
    const { name, isGroup, members } = req.body;
    // Add creator to members list
    const allMembers = [...new Set([...members, req.userId])];
    const room = await Room.create({
      name,
      isGroup: isGroup || false,
      members: allMembers,
      createdBy: req.userId,
    });
    await room.populate('members', 'username status');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rooms  — get all rooms for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.userId })
      .populate('members', 'username status lastSeen')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rooms/:id  — get a single room
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('members', 'username status lastSeen');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
