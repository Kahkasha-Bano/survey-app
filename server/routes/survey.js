const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const { verifyToken, requireRole } = require('../middleware/auth');
const fs = require('fs');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { clientName, surveyDate, surveyedBy, latitude, longitude, progress } = req.body;
    let filePath = "";
    let imagePath = "";

    // 🛡️ Check if files are present
    if (req.files?.file) {
      const file = req.files.file;
      filePath = `uploads/${Date.now()}_${file.name}`;
      await file.mv(filePath);
    }

    if (req.files?.siteImage) {
      const siteImage = req.files.siteImage;
      imagePath = `uploads/${Date.now()}_${siteImage.name}`;
      await siteImage.mv(imagePath);
    }

    const survey = new Survey({
      clientName,
      surveyDate,
      surveyedBy,
      filePath,
      imagePath,
      latitude,
      longitude,
      progress,
    });

    await survey.save();
    res.send({ success: true });
  } catch (err) {
    console.error("❌ Survey Save Error:", err);
    res.status(500).send("Server error");
  }
});
router.post('/:id/payment', verifyToken, async (req, res) => {
  try {
    const { amount, mode, paymentDate, notes } = req.body;
    const survey = await Survey.findById(req.params.id);

    if (!survey) return res.status(404).json({ message: "Survey not found" });

    survey.payments.push({ amount, mode, paymentDate, notes });
    survey.amountReceived += amount;
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


router.get('/all', verifyToken, async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.json(surveys);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).send("Server error");
  }
});
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    res.json(survey);
  } catch (err) {
    res.status(500).json({ error: "Survey not found" });
  }
});


module.exports = router;
