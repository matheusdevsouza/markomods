import express from 'express';
import { adminSecurityMiddleware } from '../middleware/adminSecurity.js';
import { optionalAuth, requireAdmin, requirePermission, authenticateToken } from '../middleware/auth.js';
import {
  createChangelog,
  updateChangelog,
  deleteChangelog,
  listPublicChangelogs,
  listAllChangelogs,
  getChangelogBySlug
} from '../controllers/changelogController.js';

const router = express.Router();

router.get('/public', listPublicChangelogs);
router.get('/public/:slug', optionalAuth, getChangelogBySlug);

router.get('/', authenticateToken, adminSecurityMiddleware, requirePermission('view_changelogs'), listAllChangelogs);
router.post('/', authenticateToken, adminSecurityMiddleware, requirePermission('manage_changelogs'), createChangelog);
router.put('/:id', authenticateToken, adminSecurityMiddleware, requirePermission('manage_changelogs'), updateChangelog);
router.delete('/:id', authenticateToken, adminSecurityMiddleware, requirePermission('manage_changelogs'), deleteChangelog);

export default router;


