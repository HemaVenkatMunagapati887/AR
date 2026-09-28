const User = require('../models/User');
const Attempt = require('../models/Attempt');
const Certificate = require('../models/Certificate');
const Module = require('../models/Module');

async function stats(req, res, next) {
  try {
    const [totalWorkers, totalModules, attempts, certificatesIssued] = await Promise.all([
      User.countDocuments({ role: 'worker' }),
      Module.countDocuments({ active: true }),
      Attempt.find(),
      Certificate.countDocuments(),
    ]);

    const passedAttempts = attempts.filter((a) => a.passed).length;
    const failedAttempts = attempts.filter((a) => !a.passed).length;
    const trainedWorkerIds = new Set(attempts.filter((a) => a.passed).map((a) => a.userId.toString()));

    res.json({
      totalWorkers,
      trainedWorkers: trainedWorkerIds.size,
      pendingWorkers: Math.max(totalWorkers - trainedWorkerIds.size, 0),
      totalModules,
      totalAttempts: attempts.length,
      passedAttempts,
      failedAttempts,
      certificatesIssued,
    });
  } catch (err) {
    next(err);
  }
}

async function listWorkers(req, res, next) {
  try {
    const workers = await User.find({ role: 'worker' }).select('-passwordHash').sort({ createdAt: -1 });
    res.json({ workers });
  } catch (err) {
    next(err);
  }
}

async function listAttempts(req, res, next) {
  try {
    const attempts = await Attempt.find()
      .populate('userId', 'name workerId sector')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ attempts });
  } catch (err) {
    next(err);
  }
}

async function listCertificates(req, res, next) {
  try {
    const certificates = await Certificate.find()
      .populate('userId', 'name workerId sector')
      .sort({ issuedAt: -1 });
    res.json({ certificates });
  } catch (err) {
    next(err);
  }
}

module.exports = { stats, listWorkers, listAttempts, listCertificates };
