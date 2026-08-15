const express = require('express');
const router = express.Router();
const Task = require('../task');
const Notification = require('../notification');
const { authMiddleware } = require('../../middleware/auth');

// GET all tasks — employee sees own, admin sees all
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query.employee = req.user.username;
        }
        // Optional filters
        if (req.query.employee && req.user.role === 'admin') query.employee = req.query.employee;
        if (req.query.status) query.status = req.query.status;

        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single task by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
        // Employee can only see own tasks
        if (req.user.role !== 'admin' && task.employee !== req.user.username) {
            return res.status(403).json({ message: 'غير مصرح' });
        }
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create task
router.post('/', authMiddleware, async (req, res) => {
    try {
        const task = new Task({
            title: req.body.title,
            description: req.body.description || '',
            location: req.body.location || '',
            type: req.body.type || 'call',
            priority: req.body.priority || 'medium',
            employee: req.user.username,
            employeeName: req.user.name || req.user.username,
            contactPhone: req.body.contactPhone || '',
            companyName: req.body.companyName || '',
            status: 'pending'
        });
        const saved = await task.save();

        // Create notification for admin
        await new Notification({
            message: req.user.name + ' أضاف مهمة جديدة: ' + task.title,
            type: 'task_created',
            targetRole: 'admin',
            relatedTask: saved._id,
            fromUser: req.user.username,
            fromUserName: req.user.name || req.user.username
        }).save();

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update task status
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
        if (req.user.role !== 'admin' && task.employee !== req.user.username) {
            return res.status(403).json({ message: 'غير مصرح' });
        }

        const oldStatus = task.status;
        if (req.body.status) task.status = req.body.status;
        if (req.body.title) task.title = req.body.title;
        if (req.body.description !== undefined) task.description = req.body.description;
        if (req.body.location) task.location = req.body.location;
        if (req.body.type) task.type = req.body.type;
        if (req.body.priority) task.priority = req.body.priority;
        if (req.body.contactPhone) task.contactPhone = req.body.contactPhone;
        if (req.body.companyName) task.companyName = req.body.companyName;
        task.updatedAt = Date.now();

        const saved = await task.save();

        // Notify admin if status changed
        if (req.body.status && req.body.status !== oldStatus) {
            const statusLabels = { pending: 'قيد الانتظار', in_progress: 'قيد التنفيذ', done: 'مكتمل', cancelled: 'ملغي' };
            await new Notification({
                message: (req.user.name || req.user.username) + ' غير حالة المهمة "' + task.title + '" إلى: ' + (statusLabels[req.body.status] || req.body.status),
                type: req.body.status === 'done' ? 'task_done' : 'task_updated',
                targetRole: 'admin',
                relatedTask: saved._id,
                fromUser: req.user.username,
                fromUserName: req.user.name || req.user.username
            }).save();
        }

        res.json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST add comment to task
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
        if (req.user.role !== 'admin' && task.employee !== req.user.username) {
            return res.status(403).json({ message: 'غير مصرح' });
        }

        task.comments.push({
            text: req.body.text,
            author: req.user.username,
            authorName: req.user.name || req.user.username
        });
        task.updatedAt = Date.now();
        const saved = await task.save();

        // Notify admin (or employee if admin commented)
        const notifTarget = req.user.role === 'admin' ? 'employee' : 'admin';
        await new Notification({
            message: (req.user.name || req.user.username) + ' أضاف تعليق على المهمة: ' + task.title,
            type: 'comment_added',
            targetRole: 'admin',
            relatedTask: saved._id,
            fromUser: req.user.username,
            fromUserName: req.user.name || req.user.username
        }).save();

        res.json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE task
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
        if (req.user.role !== 'admin' && task.employee !== req.user.username) {
            return res.status(403).json({ message: 'غير مصرح' });
        }
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم الحذف' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
