import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  clientName: String,
  type: String, // 'created', 'updated', 'file_uploaded'
  updatedFields: [String], // e.g. ['progress', 'location']
  timestamp: { type: Date, default: Date.now },
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
