const Module = require('../models/Module');

async function listModules(req, res, next) {
  try {
    const filter = { active: true };
    if (req.query.sector) {
      filter.sectors = req.query.sector;
    }
    const modules = await Module.find(filter).select('-questions.correctAnswer -questions.explanation');
    res.json({ modules });
  } catch (err) {
    next(err);
  }
}

// Full module including questions, but with correctAnswer/explanation stripped —
// the client needs question text/options for training + assessment, never the answer key.
async function getModuleForTraining(req, res, next) {
  try {
    const moduleDoc = await Module.findOne({ moduleId: req.params.id, active: true });
    if (!moduleDoc) return res.status(404).json({ error: 'Module not found' });

    const safeModule = moduleDoc.toObject();
    safeModule.questions = safeModule.questions.map((q) => ({
      questionId: q.questionId,
      questionType: q.questionType,
      question: q.question,
      options: q.options,
      points: q.points,
    }));

    res.json({ module: safeModule });
  } catch (err) {
    next(err);
  }
}

// Admin-only: full module including answer key, for content review/editing.
async function getModuleFull(req, res, next) {
  try {
    const moduleDoc = await Module.findOne({ moduleId: req.params.id });
    if (!moduleDoc) return res.status(404).json({ error: 'Module not found' });
    res.json({ module: moduleDoc });
  } catch (err) {
    next(err);
  }
}

// Worker-accessible: full module INCLUDING the answer key, downloaded once and
// cached on-device (LocalStorage.cs) so AssessmentEngine can grade an attempt
// with zero connectivity. This is a deliberate offline-first tradeoff — the
// answer key lives on the device — acceptable for an MVP where the backend
// always re-scores on sync and is the actual source of truth for certification.
async function getModuleOfflineBundle(req, res, next) {
  try {
    const moduleDoc = await Module.findOne({ moduleId: req.params.id, active: true });
    if (!moduleDoc) return res.status(404).json({ error: 'Module not found' });
    res.json({ module: moduleDoc });
  } catch (err) {
    next(err);
  }
}

module.exports = { listModules, getModuleForTraining, getModuleFull, getModuleOfflineBundle };
