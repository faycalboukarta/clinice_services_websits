import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_services';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

async function seed() {
    try {
        const existingUser = await User.findOne({ username: 'admin' });
        if (existingUser) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const hashedPassword = bcrypt.hashSync('admin123', 8);
        const user = new User({ username: 'admin', password: hashedPassword });
        await user.save();
        console.log('Admin user created successfully.');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
