const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, enum: ['task_created', 'task_updated', 'comment_added', 'task_done', 'general'], default: 'general' },
    targetRole: { type: String, default: 'admin' },
    relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    fromUser: { type: String, default: '' },
    fromUserName: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
