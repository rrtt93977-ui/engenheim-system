const router = require('express').Router();
const Company = require('../company');
const { authMiddleware, adminOnly } = require('../../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const { agent } = req.query;
        let query = {};
        if (agent) query.agent = agent;
        
        if (req.user.role === 'employee' && req.user.username !== agent) {
             query.agent = req.user.username;
        }

        const companies = await Company.find(query).sort({ createdAt: -1 });
        res.json(companies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, phone, address, status, agent, callCount, note, instagram } = req.body;
        
        const newCompany = new Company({
            name, phone, address, status, agent, callCount, note, instagram
        });

        const savedCompany = await newCompany.save();
        res.status(201).json(savedCompany);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedCompany) return res.status(404).json({ error: 'Company not found' });
        res.json(updatedCompany);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
