const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attemptsReceived: { type: Number, default: 0 },
    attemptsAccepted: { type: Number, default: 0 },
    attemptsDuplicate: { type: Number, default: 0 },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SyncLog', syncLogSchema);
