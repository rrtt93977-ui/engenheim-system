const router = require('express').Router();
const Company = require('../models/Company');

// 1. إضافة شركة جديدة وتوزيعها لموظف (خاص بالمدير)
router.post('/add', async (req, res) => {
    try {
        const { companyName, address, phone, assignedTo } = req.body;
        
        const newCompany = new Company({
            companyName,
            address,
            phone,
            assignedTo
        });

        const savedCompany = await newCompany.save();
        res.status(201).json({ message: 'تم إضافة الشركة بنجاح', savedCompany });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. جلب الشركات الخاصة بموظف معين (تظهر في داشبورد الموظف)
router.get('/my-companies/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const companies = await Company.find({ assignedTo: userId });
        res.json(companies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. تحديث حالة الاتصال (لما الموظف يخابر ويثبت النتيجة: Agreed, Meeting, etc.)
router.put('/update-status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ message: 'تم تحديث الحالة بنجاح', updatedCompany });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. جلب كل الشركات للإحصائيات (خاص بالمدير)
router.get('/all', async (req, res) => {
    try {
        const companies = await Company.find().populate('assignedTo', 'name email');
        res.json(companies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;