const express = require('express');
const router = express.Router();
const accessRequestController = require('../controllers/accessRequest.controller');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /access-request:
 *   post:
 *     summary: Request a role upgrade
 *     tags: [AccessRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestedRole
 *               - reason
 *             properties:
 *               requestedRole:
 *                 type: string
 *                 enum: [Admin, Analyst]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request submitted successfully
 */
router.post('/', authenticate, accessRequestController.createRequest);

/**
 * @swagger
 * /access-request:
 *   get:
 *     summary: Get all role upgrade requests
 *     tags: [AccessRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests
 */
router.get('/', authenticate, authorize('Admin'), accessRequestController.getAllRequests);

/**
 * @swagger
 * /access-request/{id}/approve:
 *   patch:
 *     summary: Approve a role upgrade request
 *     tags: [AccessRequests]
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
 *         description: Request approved
 */
router.patch('/:id/approve', authenticate, authorize('Admin'), accessRequestController.approveRequest);

/**
 * @swagger
 * /access-request/{id}/reject:
 *   patch:
 *     summary: Reject a role upgrade request
 *     tags: [AccessRequests]
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
 *         description: Request rejected
 */
router.patch('/:id/reject', authenticate, authorize('Admin'), accessRequestController.rejectRequest);

module.exports = router;
