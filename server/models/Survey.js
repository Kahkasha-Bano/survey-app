const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  amount: Number,
  paymentDate: Date,
  notes: String,
}, { _id: false });


const SurveySchema = new mongoose.Schema({
  clientName: String,
  surveyDate: String, // or Date if you want
  surveyedBy: String,
  latitude: String,
  longitude: String,
  progress: String,
   totalAmount: Number,
  amountReceived: { type: Number, default: 0 },
   lastPaymentDate: Date,
  payments: [PaymentSchema],
   file:String,
  images: [String], // Array of image URLs for additional images


},{timestamps: true});

module.exports = mongoose.model('Survey', SurveySchema);


