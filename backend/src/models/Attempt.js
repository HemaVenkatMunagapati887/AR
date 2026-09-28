const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selected: { type: mongoose.Schema.Types.Mixed },
    correct: { type: Boolean, required: true },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    clientAttemptId: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moduleId: { type: String, required: true },
    answers: [answerSchema],
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    mistakes: { type: [String], default: [] },
    durationSeconds: { type: Number, default: 0 },
    syncedFromOffline: { type: Boolean, default: false },
    takenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attemptSchema.index({ userId: 1, moduleId: 1, createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
