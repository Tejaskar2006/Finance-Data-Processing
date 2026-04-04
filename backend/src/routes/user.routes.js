/**
 * User Routes (Admin Only)
 * All routes protected by authentication + Admin role authorization.
 * RBAC is enforced via middleware before controller runs.
 */
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
} = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, createUserSchema, updateUserSchema } = require('../middleware/validate');

// All user routes require authentication AND Admin role
router.use(authenticate);
router.use(authorize('Admin')); // RBAC: Only Admins can manage users

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of users returned
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', validate(createUserSchema), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user role/status (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Deactivate user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deactivated
 */
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deactivateUser);

module.exports = router;
