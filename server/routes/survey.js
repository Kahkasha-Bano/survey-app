const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const Survey = require('../models/Survey');
const { verifyToken, requireRole } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary upload helper
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ✅ Create Survey with Cloudinary image/pdf upload
router.post(
  '/',
  verifyToken,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const {
        clientName,
        surveyDate,
        surveyedBy,
        latitude,
        longitude,
        progress,
        totalAmount,
        amountReceived
      } = req.body;

      let pdfUrl= null;
          // Upload PDF to Cloudinary
      if (req.files['file']) {
         const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'raw' }, // raw for pdf
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.files['file'][0].buffer).pipe(stream);
      });
      pdfUrl = result.secure_url;
      }

      // Upload Images to Cloudinary
      let imageUrls=[];
      if (req.files['images']) {
        for (let img of req.files['images']) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'survey_images' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(img.buffer).pipe(stream);
        });
        imageUrls.push(uploadResult.secure_url);
      }
      }

      const survey = new Survey({
        clientName,
        surveyDate,
        surveyedBy,
        latitude,
        longitude,
        progress,
        file:pdfUrl,
        images:imageUrls,
        totalAmount: Number(totalAmount),
        amountReceived: Number(amountReceived),
      });

      await survey.save();
      res.status(201).json(survey);
    } catch (err) {
      console.error("❌ Survey Save Error:", err);
      res.status(500).send("Server error");
    }
  }
);

// 💰 Add payment to survey
router.post('/:id/payment', verifyToken, async (req, res) => {
  try {
    const { amount, mode, paymentDate, notes } = req.body;
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    survey.payments.push({ amount, mode, paymentDate, notes });
    survey.amountReceived += Number(amount);
    survey.lastPaymentDate = paymentDate;
    survey.paymentStatus =
      survey.amountReceived >= survey.totalAmount
        ? 'Paid'
        : survey.amountReceived > 0
        ? 'Partial'
        : 'Unpaid';

    await survey.save();
    res.json({ message: "Payment added", survey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🖼️ Upload additional images to existing survey
router.post('/:id/upload-images', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).send('Survey not found');

    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, 'survey_images')
    );
    const imagePaths = await Promise.all(uploadPromises);

    survey.images.push(...imagePaths);
    await survey.save();

    res.status(200).json({ message: 'Images uploaded successfully', images: survey.images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📥 Get all surveys
router.get('/all', verifyToken, async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.json(surveys);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).send("Server error");
  }
});

// 📋 Get survey by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    res.json(survey);
  } catch (err) {
    res.status(500).json({ error: "Survey not found" });
  }
});

// 🗑️ DELETE survey
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    res.json({ message: "Survey deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✏️ Update Survey
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const survey = await Survey.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(survey);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
