const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const { authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all users (admin only)
router.get('/', authorize('admin'), [
    query('role').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const {
            role,
            page = 1,
            limit = 20
        } = req.query;

        const options = {
            role,
            offset: (page - 1) * limit,
            limit: parseInt(limit)
        };

        const users = await User.findAll(options);

        res.json({
            users: users.map(u => u.toJSON()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: users.length
            }
        });

    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Users can only view their own profile or admins can view any
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied'
            });
        }
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            user: user.toJSON()
        });

    } catch (error) {
        logger.error('Get user error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Deactivate user (admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.user.id === id) {
            return res.status(400).json({
                error: 'Cannot deactivate your own account'
            });
        }
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        await user.deactivate();

        logger.info(`User deactivated: ${user.email} by ${req.user.email}`);

        res.json({
            message: 'User deactivated successfully'
        });

    } catch (error) {
        logger.error('Deactivate user error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router;