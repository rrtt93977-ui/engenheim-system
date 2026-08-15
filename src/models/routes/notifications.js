const express = require('express');
const router = express.Router();
const Notification = require('../notification');
const { authMiddleware } = require('../../middleware/auth');

// GET notifications (admin only gets admin-targeted, but we allow all for flexibility)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ targetRole: 'admin' })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET unread count
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ targetRole: 'admin', isRead: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT mark single as read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: 'done' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany({ targetRole: 'admin', isRead: false }, { isRead: true });
        res.json({ message: 'done' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
