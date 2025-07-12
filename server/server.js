const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));

app.use('/auth', require('./routes/auth'));
app.use('/api/survey', require('./routes/survey'));

app.listen(process.env.PORT, () => console.log(`🚀 Server running on ${process.env.PORT}`));