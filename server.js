const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname)));

const dataFile = path.join(__dirname, 'companies.json');

// قراءة الشركات
function getCompanies() {
    if (!fs.existsSync(dataFile)) return [];
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// حفظ الشركات
function saveCompanies(companies) {
    fs.writeFileSync(dataFile, JSON.stringify(companies, null, 2));
}

// API جلب الشركات
app.get('/api/companies', (req, res) => {
    const agent = req.query.agent;
    let companies = getCompanies();
    if (agent) {
        companies = companies.filter(c => c.agent === agent);
    }
    res.json(companies);
});

// API إضافة شركة جديدة
app.post('/api/companies', (req, res) => {
    let companies = getCompanies();
    const newComp = { id: Date.now().toString(), ...req.body, callCount: req.body.callCount || 0 };
    companies.push(newComp);
    saveCompanies(companies);
    res.status(201).json(newComp);
});

// API تحديث شركة (حالة أو مكالمات)
app.put('/api/companies/:id', (req, res) => {
    let companies = getCompanies();
    const index = companies.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        companies[index] = { ...companies[index], ...req.body };
        saveCompanies(companies);
        res.json(companies[index]);
    } else {
        res.status(404).json({ error: 'Company not found' });
    }
});

// API حذف شركة
app.delete('/api/companies/:id', (req, res) => {
    let companies = getCompanies();
    companies = companies.filter(c => c.id !== req.params.id);
    saveCompanies(companies);
    res.json({ message: 'Deleted successfully' });
});

// مثال على شكل الـ endpoint بملف server.js لتخزين الشركات
app.post('/api/companies', (req, res) => {
    let newCompany = {
        id: Date.now().toString(),
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        note: req.body.note || '',          // ملاحظة الشركة
        instagram: req.body.instagram || '',// حساب الانستقرام
        agent: req.body.agent,              // الموظف مثل EMB1
        status: req.body.status || 'NoDeal',
        callCount: req.body.callCount || 0
    };

    // قراءة ملف companies.json أو قاعدة البيانات والإضافة عليها
    // (هذا الجزء المفروض موجود أصلاً عندك، بس تأكد أنه يحفظ الـ note والـ instagram وياهم)
});
app.listen(3000, () => { console.log('Server is running on port 3000'); });
