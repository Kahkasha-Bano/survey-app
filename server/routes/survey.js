const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const Survey = require('../models/Survey');
const Activity = require('../models/Activity');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/uploads');

// CREATE Survey
router.post('/', verifyToken, requireRole(['admin', 'supervisor','user']), upload.fields([{ name: 'images' }, { name: 'pdf' }]), async (req, res) => {
  try {
    const { clientName, surveyDate, location, progress } = req.body;
    const newSurvey = new Survey({ clientName, surveyDate, location, progress });

    // Upload images to Cloudinary
    if (req.files?.images) {
      for (const file of req.files.images) {
        const streamUpload = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'survey/images' }, (error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        newSurvey.images.push(streamUpload.secure_url);
      }
    }

    // Upload PDF to Cloudinary
    if (req.files?.pdf?.length) {
      const pdfFile = req.files.pdf[0];
      const streamUpload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'survey/pdf', resource_type: 'raw' }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(pdfFile.buffer).pipe(stream);
      });
      newSurvey.pdf = streamUpload.secure_url;
    }

    const savedSurvey = await newSurvey.save();

    await Activity.create({
      surveyId: savedSurvey._id,
      clientName: savedSurvey.clientName,
      type: 'created',
    });

    res.status(201).json(savedSurvey);
  } catch (err) {
    console.error('Error creating survey:', err);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// GET all surveys
router.get('/', verifyToken, async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ surveyDate: -1 });
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// GET single survey by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    res.json(survey);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// UPDATE survey
router.put('/:id', verifyToken, requireRole(['admin', 'supervisor']), upload.fields([{ name: 'images' }, { name: 'pdf' }]), async (req, res) => {
  try {
    const { clientName, surveyDate, location, progress } = req.body;
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });

    const updatedFields = [];

    if (clientName && clientName !== survey.clientName) {
      survey.clientName = clientName;
      updatedFields.push('clientName');
    }
    if (surveyDate && surveyDate !== survey.surveyDate) {
      survey.surveyDate = surveyDate;
      updatedFields.push('surveyDate');
    }
    if (location && location !== survey.location) {
      survey.location = location;
      updatedFields.push('location');
    }
    if (progress && progress !== survey.progress) {
      survey.progress = progress;
      updatedFields.push('progress');
    }

    // Upload new images
    if (req.files?.images) {
      for (const file of req.files.images) {
        const streamUpload = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'survey/images' }, (error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        survey.images.push(streamUpload.secure_url);
      }
      updatedFields.push('images');
    }

    // Upload new PDF
    if (req.files?.pdf?.length) {
      const pdfFile = req.files.pdf[0];
      const streamUpload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'survey/pdf', resource_type: 'raw' }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(pdfFile.buffer).pipe(stream);
      });
      survey.pdf = streamUpload.secure_url;
      updatedFields.push('pdf');
    }

    const updatedSurvey = await survey.save();

    await Activity.create({
      surveyId: updatedSurvey._id,
      clientName: updatedSurvey.clientName,
      type: 'updated',
      updatedFields,
    });

    res.json(updatedSurvey);
  } catch (err) {
    console.error('Error updating survey:', err);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// DELETE survey
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const deletedSurvey = await Survey.findByIdAndDelete(req.params.id);
    if (!deletedSurvey) return res.status(404).json({ error: 'Survey not found' });
    res.json({ message: 'Survey deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

module.exports = router;
