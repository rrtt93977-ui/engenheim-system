require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../user');

async function createFiveEmployeesAndAdmin() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is missing in .env');
        
        console.log('Connecting to MongoDB Atlas using Google DNS (8.8.8.8)...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully!');

        const usersList = [
            { name: 'مدير النظام', username: 'admin', email: 'admin@system.com', password: 'admin123', role: 'admin', target: 0 },
            { name: 'عباس', username: 'emp1', email: 'abbas@system.com', password: '1234', role: 'employee', target: 20 },
            { name: 'أحمد', username: 'emp2', email: 'ahmed@system.com', password: '1234', role: 'employee', target: 20 },
            { name: 'أمير', username: 'emp3', email: 'ameer@system.com', password: '1234', role: 'employee', target: 25 },
            { name: 'sales 1', username: 'emp4', email: 'sales1@system.com', password: '1234', role: 'employee', target: 15 },
            { name: 'sales 2', username: 'emp5', email: 'sales2@system.com', password: '1234', role: 'employee', target: 30 }
        ];

        for (const userData of usersList) {
            const existingUser = await User.findOne({ username: userData.username });
            if (existingUser) {
                console.log('User already exists: ' + userData.username);
                await User.updateOne({ username: userData.username }, { target: userData.target });
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const newUser = new User({
                name: userData.name,
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                target: userData.target
            });

            await newUser.save();
            console.log('Created user: ' + userData.name + ' (' + userData.username + ')');
        }

        console.log('Finished creating all users successfully in MongoDB Atlas!');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
}

createFiveEmployeesAndAdmin();
