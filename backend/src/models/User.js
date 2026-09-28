const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    workerId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    sector: {
      type: String,
      enum: ['Mining', 'Steel', 'Mica', 'Other'],
      default: 'Mining',
    },
    language: { type: String, enum: ['en', 'hi', 'sat'], default: 'en' },
    role: { type: String, enum: ['worker', 'admin'], default: 'worker' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
