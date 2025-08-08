// routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// CHANGE THIS LINE: Import verifyToken as a named export
const { verifyToken } = require('../middleware/auth'); // <--- This extracts verifyToken function

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

         if (!name || !email || !password || !role) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hash = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hash, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during registration');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send('Invalid credentials');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Wrong password');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Add expiresIn for good practice
    res.send({ token, user: { name: user.name, role: user.role } });
});

// Use the imported verifyToken function directly
router.get('/me', verifyToken, async (req, res) => { // This is your Line 38
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;