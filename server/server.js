const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log(' MongoDB Connected'))
  .catch(err => console.error(' Mongo error', err));

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 🗂️ Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🛣️ Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/survey', require('./routes/survey')); // multer will be used inside survey.js

// 🚀 Start server
app.listen(process.env.PORT, () => console.log(` Server running on ${process.env.PORT}`));
