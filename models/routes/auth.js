const router = require('express').Router();
const User = require('../user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware, adminOnly } = require('../../middleware/auth');

router.post('/register', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, username, email, password, role, target } = req.body;
        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: 'المستخدم أو الإيميل موجود مسبقاً' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            role: role || 'employee',
            target: target || 20
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'تم إنشاء الحساب بنجاح', userId: savedUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        const user = await User.findOne(email ? { email } : { username });
        if (!user) return res.status(400).json({ message: 'الحساب غير موجود' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
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

router.get('/employees', authMiddleware, async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
