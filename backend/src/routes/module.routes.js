const express = require('express');
const {
  listModules,
  getModuleForTraining,
  getModuleFull,
  getModuleOfflineBundle,
} = require('../controllers/module.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listModules);
router.get('/:id', requireAuth, getModuleForTraining);
router.get('/:id/offline-bundle', requireAuth, getModuleOfflineBundle);
router.get('/:id/full', requireAuth, requireAdmin, getModuleFull);

module.exports = router;
