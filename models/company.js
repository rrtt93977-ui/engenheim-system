const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Called', 'Agreed', 'Rejected', 'Meeting'], 
        default: 'Pending' 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);