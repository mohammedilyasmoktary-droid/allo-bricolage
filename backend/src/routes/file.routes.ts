import express from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// File routes are handled by static middleware in server.ts
// This route is just for health check or future file management

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'File service is running' });
});

// TODO: Add file deletion endpoint when needed
// router.delete('/:filename', authenticate, async (req, res) => {
//   // Delete file logic
// });

export { router as fileRouter };

