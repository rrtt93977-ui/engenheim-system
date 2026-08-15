const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'توكن مفقود، يرجى تسجيل الدخول' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'توكن غير صالح' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'توكن منتهي أو غير صالح، يرجى إعادة تسجيل الدخول' });
    }
}

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'صلاحية المدير مطلوبة لهذا الإجراء' });
    }
    next();
}

module.exports = { authMiddleware, adminOnly };
