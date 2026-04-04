/**
 * Dashboard Routes
 * All authenticated users can access (data is restricted by role in controller).
 */
const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('Admin', 'Analyst', 'Viewer'), getDashboard);

module.exports = router;
