const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true },
    moduleId: { type: String, required: true },
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    status: { type: String, enum: ['VALID', 'REVOKED'], default: 'VALID' },
    issuedAt: { type: Date, default: Date.now },
    qrPayloadUrl: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
