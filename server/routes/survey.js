const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, (req, res) => {
  const { clientName, surveyDate, surveyedBy, latitude, longitude, progress } = req.body;
  const file = req.files?.file;
  const siteImage = req.files?.siteImage;

  const filePath = `uploads/${Date.now()}_${file.name}`;
  const imagePath = `uploads/${Date.now()}_${siteImage.name}`;

  file.mv(filePath);
  siteImage.mv(imagePath);

  const q = `INSERT INTO surveys (client_name, survey_date, surveyed_by, file_path, image_path, latitude, longitude, progress)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(q, [clientName, surveyDate, surveyedBy, filePath, imagePath, latitude, longitude, progress], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ success: true });
  });
});

router.get('/all', verifyToken, requireRole('admin'), (req, res) => {
  db.query('SELECT * FROM surveys', (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

module.exports = router;