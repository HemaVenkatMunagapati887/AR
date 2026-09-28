const express = require('express');
const { syncResults } = require('../controllers/sync.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/results', requireAuth, syncResults);

module.exports = router;
