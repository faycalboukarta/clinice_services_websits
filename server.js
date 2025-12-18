import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_services';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_prod';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Models ---

const SubmissionSchema = new mongoose.Schema({
    name: String,
    phone: String,
    service: String,
    message: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'New' }
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    imageUrl: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const PackageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    features: [String],
    description: String,
    ctaLink: String
});

const Submission = mongoose.model('Submission', SubmissionSchema);
const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Package = mongoose.model('Package', PackageSchema);

// --- Middleware ---

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

// --- Routes ---

// 1. Submissions (Existing)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, service, message } = req.body;
        const newSubmission = new Submission({ name, phone, service, message });
        await newSubmission.save();
        res.status(201).json({ message: 'Submission saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving submission', error });
    }
});

app.get('/api/admin/submissions', verifyToken, async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ date: -1 });
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions', error });
    }
});

app.delete('/api/admin/submissions/:id', verifyToken, async (req, res) => {
    try {
        await Submission.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Submission deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting submission', error });
    }
});

// 2. Auth (Updated with Register)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ token: null, message: 'Invalid password' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: 86400 });
        res.status(200).json({ auth: true, token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

app.post('/api/auth/register', verifyToken, async (req, res) => {
    try {
        const { username, password } = req.body;
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = bcrypt.hashSync(password, 8);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

app.post('/api/auth/seed', async (req, res) => {
    const exists = await User.findOne({ username: 'admin' });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const hashedPassword = bcrypt.hashSync('admin123', 8);
    const user = new User({ username: 'admin', password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Admin user created. Username: admin, Password: admin123' });
});

// 3. Portfolio Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ date: -1 });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
});

app.post('/api/projects', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Image is required' });

        const imageUrl = `/uploads/${req.file.filename}`;
        const newProject = new Project({ title, description, imageUrl });
        await newProject.save();
        res.status(201).json({ message: 'Project added successfully', project: newProject });
    } catch (error) {
        res.status(500).json({ message: 'Error adding project', error });
    }
});

app.delete('/api/projects/:id', verifyToken, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error });
    }
});

// 4. Packages
app.get('/api/packages', async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error });
    }
});

app.put('/api/packages/:id', verifyToken, async (req, res) => {
    try {
        const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedPackage);
    } catch (error) {
        res.status(500).json({ message: 'Error updating package', error });
    }
});

app.post('/api/packages/seed', async (req, res) => {
    try {
        const count = await Package.countDocuments();
        if (count > 0) return res.status(400).json({ message: 'Packages already seeded' });

        const defaultPackages = [
            {
                name: 'الباقة الأساسية',
                price: '25,000',
                features: ['تصميم موقع صفحة واحدة', 'تصميم متجاوب', 'لوحة تحكم بسيطة', 'دعم فني لمدة شهر'],
                ctaLink: 'https://wa.me/213549936340?text=أنا مهتم بالباقة الأساسية'
            },
            {
                name: 'باقة الأعمال',
                price: '45,000',
                features: ['تصميم موقع متعدد الصفحات', 'تهيئة محركات البحث (SEO)', 'ربط مع وسائل التواصل', 'دعم فني لمدة 3 أشهر'],
                ctaLink: 'https://wa.me/213549936340?text=أنا مهتم بباقة الأعمال'
            },
            {
                name: 'باقة الشركات',
                price: 'اتصل بنا',
                features: ['حلول برمجية مخصصة', 'متجر إلكتروني متكامل', 'تطبيقات موبايل', 'دعم فني و صيانة سنوية'],
                ctaLink: 'https://wa.me/213549936340?text=أنا مهتم بباقة الشركات'
            }
        ];
        await Package.insertMany(defaultPackages);
        res.status(201).json({ message: 'Packages seeded' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding packages', error });
    }
});

// Server Setup
app.get('*', (req, res) => {
    const reqPath = req.path;
    if (reqPath === '/admin') {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else if (reqPath.indexOf('.') === -1) {
        res.sendFile(path.join(__dirname, reqPath + '.html'), (err) => {
            if (err) res.sendFile(path.join(__dirname, 'index.html'));
        });
    } else {
        res.sendFile(path.join(__dirname, reqPath));
    }
});

if (process.env.NODE_ENV !== 'production' || process.env.VITE_VERCEL_ENV === undefined) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
