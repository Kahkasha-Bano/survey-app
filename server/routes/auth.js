const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, role || 'user'], (err) => {
      if (err) return res.status(500).send('User exists');
      res.send({ message: 'User registered' });
    });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, users) => {
    if (err || users.length === 0) return res.status(401).send('Invalid credentials');
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Wrong password');
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.send({ token, user: { name: user.name, role: user.role } });
  });
});

module.exports = router;