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
const PaymentSchema = new mongoose.Schema({
  amount: Number,
  mode: { type: String, enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque'] },
  paymentDate: Date,
  notes: String,
}, { _id: false });

const SurveySchema = new mongoose.Schema({
  // your fields...
  totalAmount: Number,
  amountReceived: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  lastPaymentDate: Date,
  payments: [PaymentSchema],
});


module.exports = mongoose.model('Survey', SurveySchema);


