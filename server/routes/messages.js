const router = require('express').Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// GET /api/messages/:roomId?page=1&limit=30
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({
      room: req.params.roomId
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('sender', 'username')
      .lean();

    res.json(messages.reverse());

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;