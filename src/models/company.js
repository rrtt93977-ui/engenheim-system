const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Deal', 'NoDeal', 'Meeting', 'Called'], 
        default: 'NoDeal' 
    },
    agent: { type: String, required: true },
    callCount: { type: Number, default: 0 },
    note: { type: String, default: '' },
    instagram: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);
