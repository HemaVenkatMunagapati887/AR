const Module = require('../models/Module');
const Attempt = require('../models/Attempt');
const SyncLog = require('../models/SyncLog');
const { scoreAttempt } = require('../utils/scoring');

/**
 * Accepts a batch of attempts recorded offline on the device (each tagged with
 * a clientAttemptId generated on-device) and upserts them idempotently, so
 * retrying a failed sync never double-counts an attempt.
 */
async function syncResults(req, res, next) {
  try {
    const { attempts } = req.body;
    if (!Array.isArray(attempts) || attempts.length === 0) {
      return res.status(400).json({ error: 'attempts[] is required' });
    }

    let accepted = 0;
    let duplicate = 0;
    const results = [];

    for (const item of attempts) {
      const { clientAttemptId, moduleId, answers, durationSeconds, takenAt } = item;

      const existing = clientAttemptId
        ? await Attempt.findOne({ clientAttemptId, userId: req.user.sub })
        : null;

      if (existing) {
        duplicate += 1;
        results.push({ clientAttemptId, status: 'duplicate', attemptId: existing._id });
        continue;
      }

      const moduleDoc = await Module.findOne({ moduleId });
      if (!moduleDoc) {
        results.push({ clientAttemptId, status: 'error', error: 'Module not found' });
        continue;
      }

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
        syncedFromOffline: true,
        takenAt: takenAt ? new Date(takenAt) : new Date(),
      });

      accepted += 1;
      results.push({ clientAttemptId, status: 'accepted', attemptId: attempt._id });
    }

    await SyncLog.create({
      userId: req.user.sub,
      attemptsReceived: attempts.length,
      attemptsAccepted: accepted,
      attemptsDuplicate: duplicate,
    });

    res.json({ accepted, duplicate, results });
  } catch (err) {
    next(err);
  }
}

module.exports = { syncResults };
