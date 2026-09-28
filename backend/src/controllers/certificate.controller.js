const Attempt = require('../models/Attempt');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Module = require('../models/Module');
const { generateCertificateId } = require('../utils/certificateId');
const { buildVerificationUrl, generateQrDataUrl } = require('../utils/qr');

async function issueCertificate(req, res, next) {
  try {
    const { attemptId } = req.body;
    if (!attemptId) return res.status(400).json({ error: 'attemptId is required' });

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.userId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'Cannot certify another worker\'s attempt' });
    }
    if (!attempt.passed) {
      return res.status(400).json({ error: 'Attempt did not pass; certificate cannot be issued' });
    }

    const existing = await Certificate.findOne({ attemptId: attempt._id });
    if (existing) {
      return res.status(200).json({ certificate: existing, alreadyIssued: true });
    }

    const certificateId = await generateCertificateId();
    const qrPayloadUrl = buildVerificationUrl(certificateId);

    const certificate = await Certificate.create({
      certificateId,
      userId: attempt.userId,
      attemptId: attempt._id,
      moduleId: attempt.moduleId,
      score: attempt.score,
      percentage: attempt.percentage,
      qrPayloadUrl,
    });

    res.status(201).json({ certificate });
  } catch (err) {
    next(err);
  }
}

async function getCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id });
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const qrDataUrl = await generateQrDataUrl(certificate.qrPayloadUrl);
    res.json({ certificate, qrDataUrl });
  } catch (err) {
    next(err);
  }
}

// Public verification endpoint — deliberately returns only non-sensitive fields.
async function verifyCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id });
    if (!certificate || certificate.status !== 'VALID') {
      return res.status(200).json({ valid: false });
    }

    const [user, moduleDoc] = await Promise.all([
      User.findById(certificate.userId),
      Module.findOne({ moduleId: certificate.moduleId }),
    ]);

    res.json({
      valid: true,
      certificateId: certificate.certificateId,
      workerName: user ? user.name : 'Unknown',
      moduleName: moduleDoc ? moduleDoc.name : certificate.moduleId,
      score: certificate.percentage,
      status: certificate.status,
      issuedAt: certificate.issuedAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { issueCertificate, getCertificate, verifyCertificate };
