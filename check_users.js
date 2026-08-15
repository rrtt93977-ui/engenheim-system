require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const User = require('./src/models/user');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        console.log("Users in DB:", users.length);
        if (users.length > 0) {
            console.log("Admin email:", users[0].email);
            console.log("Admin username:", users[0].username);
            console.log("Is password 'password'? ", await require('bcryptjs').compare('password', users[0].password));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkUsers();
