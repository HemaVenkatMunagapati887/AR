const Certificate = require('../models/Certificate');

/**
 * Generates sequential certificate IDs like JH-SAFE-2026-00001.
 * Sequence is derived from the count of certificates issued in the current year,
 * which is sufficient for hackathon-MVP scale (no high-concurrency guarantee).
 */
async function generateCertificateId() {
  const year = new Date().getFullYear();
  const prefix = `JH-SAFE-${year}-`;
  const count = await Certificate.countDocuments({ certificateId: new RegExp(`^${prefix}`) });
  const next = String(count + 1).padStart(5, '0');
  return `${prefix}${next}`;
}

module.exports = { generateCertificateId };
