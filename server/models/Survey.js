const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  clientName: String,
  surveyDate: String,
  surveyedBy: String,
  filePath: String,
  imagePath: String,
  latitude: String,
  longitude: String,
  progress: String
});

module.exports = mongoose.model('Survey', surveySchema);