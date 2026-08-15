const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, required: true },
    authorName: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    type: { type: String, enum: ['call', 'visit', 'other'], default: 'call' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    employee: { type: String, required: true },
    employeeName: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'in_progress', 'done', 'cancelled'], default: 'pending' },
    contactPhone: { type: String, default: '' },
    companyName: { type: String, default: '' },
    comments: [CommentSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

TaskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Task', TaskSchema);
