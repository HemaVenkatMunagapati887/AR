const express = require('express');
const { listModules, getModuleForTraining, getModuleFull } = require('../controllers/module.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listModules);
router.get('/:id', requireAuth, getModuleForTraining);
router.get('/:id/full', requireAuth, requireAdmin, getModuleFull);

module.exports = router;
