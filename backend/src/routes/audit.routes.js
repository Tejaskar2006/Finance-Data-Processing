const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const auditController = require('../controllers/audit.controller');

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Audit log for system actions
 */

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get all audit logs
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Logs per page
 *     responses:
 *       200:
 *         description: Successfully fetched logs
 */
router.get('/', authenticate, authorize('Admin'), auditController.getAllLogs);

/**
 * @swagger
 * /audit-logs/{id}:
 *   get:
 *     summary: Get a single audit log
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched log
 *       404:
 *         description: Log not found
 */
router.get('/:id', authenticate, authorize('Admin'), auditController.getLogById);

module.exports = router;
