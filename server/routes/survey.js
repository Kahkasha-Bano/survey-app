const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const { verifyToken, requireRole } = require('../middleware/auth');
const fs = require('fs');

router.post('/', verifyToken, async (req, res) => {
  const { clientName, surveyDate, surveyedBy, latitude, longitude, progress } = req.body;
  const file = req.files?.file;
  const siteImage = req.files?.siteImage;

  const filePath = `uploads/${Date.now()}_${file.name}`;
  const imagePath = `uploads/${Date.now()}_${siteImage.name}`;

  file.mv(filePath);
  siteImage.mv(imagePath);

  const survey = new Survey({ clientName, surveyDate, surveyedBy, filePath, imagePath, latitude, longitude, progress });
  await survey.save();
  res.send({ success: true });
});

router.get('/all', verifyToken, requireRole('admin'), async (req, res) => {
  const surveys = await Survey.find();
  res.json(surveys);
});

module.exports = router;