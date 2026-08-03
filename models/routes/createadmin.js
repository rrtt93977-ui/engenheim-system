const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createFiveEmployeesAndAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/sales_dashboard');
        console.log('متصل بقاعدة البيانات بنجاح...');

        const usersList = [
            {
                name: 'مدير النظام',
                email: 'admin@system.com',
                password: '123456',
                role: 'admin'
            },
            {
                name: 'عباس',
                email: 'abbas@system.com',
                password: '123456',
                role: 'employee'
            },
            {
                name: 'أحمد',
                email: 'ahmed@system.com',
                password: '123456',
                role: 'employee'
            },
            {
                name: 'أمير',
                email: 'ameer@system.com',
                password: '123456',
                role: 'employee'
            },
            {
                name: 'sales 1',
                email: 'sales1 @system.com',
                password: '123456',
                role: 'employee'
            },
            {
                name: 'sales 2',
                email: 'msales2 @system.com',
                password: '123456',
                role: 'employee'
            }
        ];

        for (let userData of usersList) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`الحساب ${userData.email} موجود مسبقاً.`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const newUser = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role
            });

            await newUser.save();
            console.log(`تم إنشاء حساب: ${userData.name} (${userData.email})`);
        }

        console.log('تم الانتهاء من إنشاء جميع الحسابات بنجاح!');
        process.exit();
    } catch (err) {
        console.error('خطأ:', err);
        process.exit();
    }
}

createFiveEmployeesAndAdmin();