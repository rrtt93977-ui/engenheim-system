const router = require('express').Router();
const User = require('../User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key_here'; // مفتاح سري مؤقت للتشفير

// 1. تسجيل حساب جديد (Register)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // التحقق إذا المستخدم موجود مسبقاً
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });

        // تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // إنشاء المستخدم الجديد
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee'
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'تم إنشاء الحساب بنجاح', userId: savedUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. تسجيل الدخول (Login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // البحث عن المستخدم بالإيميل
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'الإيميل أو كلمة المرور غير صحيحة' });

        // مطابقة كلمة المرور المشفرة
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'الإيميل أو كلمة المرور غير صحيحة' });

        // إنشاء توكن (Token) يحتوي على الأيدي والصلاحية (admin أو employee)
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;