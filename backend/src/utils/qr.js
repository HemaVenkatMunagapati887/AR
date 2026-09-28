const QRCode = require('qrcode');

/**
 * QR payload is a verification URL keyed by certificateId only —
 * no worker PII is embedded in the QR code itself.
 */
function buildVerificationUrl(certificateId) {
  const base = process.env.VERIFY_BASE_URL || 'http://localhost:5173/verify';
  return `${base}/${certificateId}`;
}

async function generateQrDataUrl(text) {
  return QRCode.toDataURL(text, { errorCorrectionLevel: 'M', margin: 1, width: 320 });
}

module.exports = { buildVerificationUrl, generateQrDataUrl };
