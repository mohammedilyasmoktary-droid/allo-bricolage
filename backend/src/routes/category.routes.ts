import express from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all active categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get category by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.serviceCategory.findUnique({
      where: { id: req.params.id },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error: any) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
});

// Create category (admin only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      const category = await prisma.serviceCategory.create({
        data: {
          name,
          description,
        },
      });

      res.status(201).json(category);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

// Update category (admin only)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().isString(),
    body('isActive').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, isActive } = req.body;

      const category = await prisma.serviceCategory.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json(category);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found' });
      }
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
);

export { router as categoryRouter };

