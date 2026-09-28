const Module = require('../models/Module');
const Attempt = require('../models/Attempt');
const { scoreAttempt } = require('../utils/scoring');

async function submitAttempt(req, res, next) {
  try {
    const { moduleId, answers, durationSeconds, clientAttemptId } = req.body;
    if (!moduleId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'moduleId and answers[] are required' });
    }

    if (clientAttemptId) {
      const existing = await Attempt.findOne({ clientAttemptId, userId: req.user.sub });
      if (existing) {
        return res.status(200).json({ attempt: existing, deduplicated: true });
      }
    }

    const moduleDoc = await Module.findOne({ moduleId });
    if (!moduleDoc) return res.status(404).json({ error: 'Module not found' });

    const { gradedAnswers, score, maxScore, percentage, passed, mistakes } = scoreAttempt(
      moduleDoc,
      answers
    );

    const attempt = await Attempt.create({
      clientAttemptId,
      userId: req.user.sub,
      moduleId,
      answers: gradedAnswers,
      score,
      maxScore,
      percentage,
      passed,
      mistakes,
      durationSeconds: durationSeconds || 0,
      syncedFromOffline: false,
    });

    res.status(201).json({ attempt });
  } catch (err) {
    next(err);
  }
}

async function getAttemptsForUser(req, res, next) {
  try {
    if (req.user.role !== 'admin' && req.user.sub !== req.params.userId) {
      return res.status(403).json({ error: 'Cannot view another worker\'s attempts' });
    }
    const attempts = await Attempt.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ attempts });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitAttempt, getAttemptsForUser };
