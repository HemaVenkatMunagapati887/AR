const express = require('express');
const { submitAttempt, getAttemptsForUser } = require('../controllers/attempt.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, submitAttempt);
router.get('/:userId', requireAuth, getAttemptsForUser);

module.exports = router;
