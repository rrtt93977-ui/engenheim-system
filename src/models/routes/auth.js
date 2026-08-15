const router = require('express').Router();
const User = require('../user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware, adminOnly } = require('../../middleware/auth');

// Add new employee (Admin only)
router.post('/register', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, username, email, password, role, target } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: 'البريد أو المستخدم مسجل مسبقاً' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, username, email, password: hashedPassword, role: role || 'employee', target: target || 20 });
        const savedUser = await newUser.save();
        res.status(201).json({ message: 'تم إضافة الموظف بنجاح', userId: savedUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update employee (Admin only)
router.put('/employees/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, username, email, password, target } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'الموظف غير موجود' });

        if (name) user.name = name;
        if (username) user.username = username;
        if (email) user.email = email;
        if (target) user.target = target;
        
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const savedUser = await user.save();
        res.json({ message: 'تم تحديث بيانات الموظف بنجاح', user: savedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete employee (Admin only)
router.delete('/employees/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم حذف الموظف' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const user = await User.findOne(email ? { email } : { username });
        if (!user) return res.status(400).json({ message: 'البيانات غير صحيحة' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update avatar (User updates their own avatar)
router.put('/me/avatar', authMiddleware, async (req, res) => {
    try {
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ message: 'لم يتم إرسال صورة' });
        
        const user = await User.findById(req.user.id);
        user.avatar = avatar; // base64 string
        await user.save();
        
        res.json({ message: 'تم تحديث الصورة', avatar: user.avatar });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/employees', authMiddleware, async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
