/**
 * Financial Record Routes
 * Demonstrates per-route RBAC:
 *   - GET  → Admin + Analyst + Viewer (with data restrictions in controller)
 *   - POST → Admin only
 *   - PATCH → Admin only
 *   - DELETE → Admin only
 */
const express = require('express');
const router = express.Router();
const {
  getRecords,
  getRecordById,
  getDeletedRecords,
  createRecord,
  updateRecord,
  restoreRecord,
  deleteRecord,
} = require('../controllers/record.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, createRecordSchema, updateRecordSchema } = require('../middleware/validate');

// All record routes require a valid token
router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List all financial records
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *     responses:
 *       200:
 *         description: List of records returned
 */
router.get('/', authorize('Admin', 'Analyst', 'Viewer'), getRecords);

/**
 * @swagger
 * /api/records/trash:
 *   get:
 *     summary: List deleted financial records (Admin/Analyst only)
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: List of deleted records returned
 */
router.get('/trash', authorize('Admin', 'Analyst'), getDeletedRecords);
/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get record by ID
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record details
 *       404:
 *         description: Not found
 */
router.get('/:id', authorize('Admin', 'Analyst', 'Viewer'), getRecordById);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create new record (Admin only)
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialRecord'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authorize('Admin'), validate(createRecordSchema), createRecord);
/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update record (Admin only)
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialRecord'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Soft delete record (Admin only)
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.patch('/:id', authorize('Admin'), validate(updateRecordSchema), updateRecord);

/**
 * @swagger
 * /api/records/{id}/restore:
 *   patch:
 *     summary: Restore a deleted record (Admin only)
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record restored successfully
 */
router.patch('/:id/restore', authorize('Admin'), restoreRecord);

router.delete('/:id', authorize('Admin'), deleteRecord);

module.exports = router;
