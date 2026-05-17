import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All routes below this are protected
router.use(protect);

// Profile routes (for logged in user)
router.put(
  '/profile',
  [
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty')
  ],
  validate,
  updateProfile
);

router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  validate,
  changePassword
);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(
    [
      body('email').optional().isEmail().withMessage('Please enter a valid email'),
      body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
    ],
    validate,
    updateUser
  )
  .delete(deleteUser);

export default router;