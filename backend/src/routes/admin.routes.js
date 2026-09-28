const express = require('express');
const { stats, listWorkers, listAttempts, listCertificates } = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/stats', stats);
router.get('/workers', listWorkers);
router.get('/attempts', listAttempts);
router.get('/certificates', listCertificates);

module.exports = router;
