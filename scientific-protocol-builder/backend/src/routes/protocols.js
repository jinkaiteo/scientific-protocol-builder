const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Protocol = require('../models/Protocol');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const protocolValidation = [
    body('name').trim().isLength({ min: 1 }).withMessage('Protocol name is required'),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('tags').optional().isArray(),
    body('version').optional().trim(),
    body('workspaceXml').notEmpty().withMessage('Workspace XML is required'),
    body('workspaceJson').optional(),
    body('analysisData').optional(),
    body('isPublic').optional().isBoolean(),
    body('isTemplate').optional().isBoolean()
];

// Get all protocols with filtering and pagination
router.get('/', [
    query('category').optional().trim(),
    query('tags').optional(),
    query('search').optional().trim(),
    query('isTemplate').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('orderBy').optional().isIn(['name', 'created_at', 'updated_at']),
    query('orderDirection').optional().isIn(['ASC', 'DESC'])
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
            category,
            tags,
            search,
            isTemplate,
            page = 1,
            limit = 20,
            orderBy = 'updated_at',
            orderDirection = 'DESC'
        } = req.query;

        const options = {
            userId: req.user.id,
            category,
            tags: tags ? tags.split(',') : undefined,
            search,
            isTemplate: isTemplate !== undefined ? isTemplate === 'true' : undefined,
            offset: (page - 1) * limit,
            limit: parseInt(limit),
            orderBy,
            orderDirection
        };

        const protocols = await Protocol.findAll(options);

        res.json({
            protocols: protocols.map(p => p.toJSON()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: protocols.length
            }
        });

    } catch (error) {
        logger.error('Get protocols error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get protocol by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const protocol = await Protocol.findById(id, req.user.id);
        if (!protocol) {
            return res.status(404).json({
                error: 'Protocol not found'
            });
        }

        res.json({
            protocol: protocol.toJSON()
        });

    } catch (error) {
        logger.error('Get protocol error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Create new protocol
router.post('/', protocolValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const protocol = await Protocol.create(req.body, req.user.id);

        logger.info(`Protocol created: ${protocol.name} by ${req.user.email}`);

        res.status(201).json({
            message: 'Protocol created successfully',
            protocol: protocol.toJSON()
        });

    } catch (error) {
        logger.error('Create protocol error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Update protocol
router.put('/:id', protocolValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const protocol = await Protocol.findById(id, req.user.id);
        
        if (!protocol) {
            return res.status(404).json({
                error: 'Protocol not found'
            });
        }

        await protocol.update(req.body, req.user.id);

        logger.info(`Protocol updated: ${protocol.name} by ${req.user.email}`);

        res.json({
            message: 'Protocol updated successfully',
            protocol: protocol.toJSON()
        });

    } catch (error) {
        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                error: error.message
            });
        }
        
        logger.error('Update protocol error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Delete protocol
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const protocol = await Protocol.findById(id, req.user.id);
        
        if (!protocol) {
            return res.status(404).json({
                error: 'Protocol not found'
            });
        }

        await protocol.delete(req.user.id);

        logger.info(`Protocol deleted: ${protocol.name} by ${req.user.email}`);

        res.json({
            message: 'Protocol deleted successfully'
        });

    } catch (error) {
        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                error: error.message
            });
        }
        
        logger.error('Delete protocol error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Clone protocol
router.post('/:id/clone', [
    body('name').optional().trim().isLength({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { name } = req.body;
        
        const protocol = await Protocol.findById(id, req.user.id);
        if (!protocol) {
            return res.status(404).json({
                error: 'Protocol not found'
            });
        }

        const clonedProtocol = await protocol.clone(req.user.id, name);

        logger.info(`Protocol cloned: ${protocol.name} -> ${clonedProtocol.name} by ${req.user.email}`);

        res.status(201).json({
            message: 'Protocol cloned successfully',
            protocol: clonedProtocol.toJSON()
        });

    } catch (error) {
        logger.error('Clone protocol error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get protocol version history
router.get('/:id/versions', async (req, res) => {
    try {
        const { id } = req.params;
        const protocol = await Protocol.findById(id, req.user.id);
        
        if (!protocol) {
            return res.status(404).json({
                error: 'Protocol not found'
            });
        }

        const versions = await protocol.getVersionHistory();

        res.json({
            versions: versions.map(v => v.toJSON())
        });

    } catch (error) {
        logger.error('Get protocol versions error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
    try {
        const categories = await Protocol.getCategories();
        
        res.json({
            categories
        });

    } catch (error) {
        logger.error('Get categories error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get tags
router.get('/meta/tags', async (req, res) => {
    try {
        const tags = await Protocol.getTags();
        
        res.json({
            tags
        });

    } catch (error) {
        logger.error('Get tags error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router;