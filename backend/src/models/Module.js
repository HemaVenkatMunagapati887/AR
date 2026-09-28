const mongoose = require('mongoose');

const localizedStringSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    hi: { type: String, default: '' },
    sat: { type: String, default: '' },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['mcq', 'scenario', 'ordering', 'ar_task'],
      required: true,
    },
    question: { type: localizedStringSchema, required: true },
    options: [{ type: localizedStringSchema }],
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: localizedStringSchema },
    points: { type: Number, default: 10 },
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true, unique: true },
    name: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema },
    category: { type: String, required: true },
    sectors: {
      type: [String],
      default: ['Mining', 'Steel', 'Mica'],
    },
    version: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    passThreshold: { type: Number, default: 70 },
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Module', moduleSchema);
