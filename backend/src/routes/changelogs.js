import express from 'express';
import { adminSecurityMiddleware } from '../middleware/adminSecurity.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  createChangelog,
  updateChangelog,
  deleteChangelog,
  listPublicChangelogs,
  listAllChangelogs,
  getChangelogBySlug
} from '../controllers/changelogController.js';

const router = express.Router();

// público
router.get('/public', listPublicChangelogs);
router.get('/public/:slug', optionalAuth, getChangelogBySlug);

// admin
router.get('/', adminSecurityMiddleware, listAllChangelogs);
router.post('/', adminSecurityMiddleware, createChangelog);
router.put('/:id', adminSecurityMiddleware, updateChangelog);
router.delete('/:id', adminSecurityMiddleware, deleteChangelog);

export default router;


