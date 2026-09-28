const express = require('express');
const {
  issueCertificate,
  getCertificate,
  verifyCertificate,
} = require('../controllers/certificate.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, issueCertificate);
router.get('/verify/:id', verifyCertificate); // public, no auth — anyone scanning a QR can verify
router.get('/:id', requireAuth, getCertificate);

module.exports = router;
