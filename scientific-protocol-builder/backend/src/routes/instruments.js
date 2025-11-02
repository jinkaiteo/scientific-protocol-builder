const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Instrument = require('../models/Instrument');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const instrumentValidation = [
    body('name').trim().isLength({ min: 1 }).withMessage('Instrument name is required'),
    body('type').trim().isLength({ min: 1 }).withMessage('Instrument type is required'),
    body('manufacturer').optional().trim(),
    body('model').optional().trim(),
    body('serialNumber').optional().trim(),
    body('location').optional().trim(),
    body('specifications').optional().isObject(),
    body('calibrationData').optional().isObject()
];

// Get all instruments with filtering and pagination
router.get('/', [
    query('type').optional().trim(),
    query('manufacturer').optional().trim(),
    query('location').optional().trim(),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('orderBy').optional().isIn(['name', 'type', 'created_at', 'updated_at']),
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
            type,
            manufacturer,
            location,
            search,
            page = 1,
            limit = 20,
            orderBy = 'created_at',
            orderDirection = 'DESC'
        } = req.query;

        const options = {
            type,
            manufacturer,
            location,
            search,
            offset: (page - 1) * limit,
            limit: parseInt(limit),
            orderBy,
            orderDirection
        };

        const instruments = await Instrument.findAll(options);

        res.json({
            instruments: instruments.map(i => i.toJSON()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: instruments.length
            }
        });

    } catch (error) {
        logger.error('Get instruments error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get instrument by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const instrument = await Instrument.findById(id);
        if (!instrument) {
            return res.status(404).json({
                error: 'Instrument not found'
            });
        }

        res.json({
            instrument: instrument.toJSON()
        });

    } catch (error) {
        logger.error('Get instrument error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Create new instrument
router.post('/', instrumentValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const instrument = await Instrument.create(req.body, req.user.id);

        logger.info(`Instrument created: ${instrument.name} by ${req.user.email}`);

        res.status(201).json({
            message: 'Instrument created successfully',
            instrument: instrument.toJSON()
        });

    } catch (error) {
        logger.error('Create instrument error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Update instrument
router.put('/:id', instrumentValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const instrument = await Instrument.findById(id);
        
        if (!instrument) {
            return res.status(404).json({
                error: 'Instrument not found'
            });
        }

        await instrument.update(req.body, req.user.id);

        logger.info(`Instrument updated: ${instrument.name} by ${req.user.email}`);

        res.json({
            message: 'Instrument updated successfully',
            instrument: instrument.toJSON()
        });

    } catch (error) {
        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                error: error.message
            });
        }
        
        logger.error('Update instrument error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Update instrument calibration
router.put('/:id/calibration', [
    body('calibrationData').isObject().withMessage('Calibration data must be an object')
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
        const { calibrationData } = req.body;
        
        const instrument = await Instrument.findById(id);
        if (!instrument) {
            return res.status(404).json({
                error: 'Instrument not found'
            });
        }

        await instrument.updateCalibration(calibrationData, req.user.id);

        logger.info(`Instrument calibration updated: ${instrument.name} by ${req.user.email}`);

        res.json({
            message: 'Calibration updated successfully',
            instrument: instrument.toJSON()
        });

    } catch (error) {
        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                error: error.message
            });
        }
        
        logger.error('Update calibration error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Deactivate instrument
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const instrument = await Instrument.findById(id);
        
        if (!instrument) {
            return res.status(404).json({
                error: 'Instrument not found'
            });
        }

        await instrument.deactivate(req.user.id);

        logger.info(`Instrument deactivated: ${instrument.name} by ${req.user.email}`);

        res.json({
            message: 'Instrument deactivated successfully'
        });

    } catch (error) {
        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                error: error.message
            });
        }
        
        logger.error('Deactivate instrument error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get instrument types
router.get('/meta/types', async (req, res) => {
    try {
        const types = await Instrument.getTypes();
        
        res.json({
            types
        });

    } catch (error) {
        logger.error('Get types error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get manufacturers
router.get('/meta/manufacturers', async (req, res) => {
    try {
        const manufacturers = await Instrument.getManufacturers();
        
        res.json({
            manufacturers
        });

    } catch (error) {
        logger.error('Get manufacturers error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get locations
router.get('/meta/locations', async (req, res) => {
    try {
        const locations = await Instrument.getLocations();
        
        res.json({
            locations
        });

    } catch (error) {
        logger.error('Get locations error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router;