import express from 'express';
import {
  getComplaints,
  getComplaint,
  createComplaint,
  updateStatus,
  addComment,
  deleteComplaint,
} from '../controllers/complaintController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected
router.use(protect);

router.route('/')
  .get(getComplaints)
  .post(createComplaint);

router.route('/:id')
  .get(getComplaint)
  .delete(deleteComplaint);

router.put('/:id/status', authorize('admin'), updateStatus);

router.post('/:id/comment', addComment);

export default router;