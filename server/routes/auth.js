const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, role });
    await user.save();
    res.send({ message: 'User registered' });
  } catch {
    res.status(500).send('User exists or error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send('Invalid credentials');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send('Wrong password');
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.send({ token, user: { name: user.name, role: user.role } });
});

module.exports = router;