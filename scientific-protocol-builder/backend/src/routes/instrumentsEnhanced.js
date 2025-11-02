const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const instrumentService = require('../services/instrumentService');
const Instrument = require('../models/Instrument');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Enhanced Instruments Routes for Week 10 Implementation
 * Provides advanced search, real-time monitoring, and Blockly integration
 */

// Validation rules
const instrumentValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Instrument name is required'),
  body('category').isIn([
    'microscope', 'centrifuge', 'incubator', 'autoclave', 'balance',
    'pipette', 'thermocycler', 'spectrophotometer', 'chromatography',
    'electrophoresis', 'microplate_reader', 'shaker', 'homogenizer',
    'freezer', 'oven', 'water_bath', 'ph_meter', 'conductivity_meter', 'custom'
  ]).withMessage('Invalid instrument category'),
  body('manufacturer').trim().isLength({ min: 1 }).withMessage('Manufacturer is required'),
  body('model').trim().isLength({ min: 1 }).withMessage('Model is required'),
  body('serialNumber').trim().isLength({ min: 1 }).withMessage('Serial number is required'),
  body('location.building').optional().trim(),
  body('location.room').optional().trim(),
  body('location.position').optional().trim()
];

const calibrationValidation = [
  body('date').isISO8601().withMessage('Valid calibration date is required'),
  body('method').trim().isLength({ min: 1 }).withMessage('Calibration method is required'),
  body('results.passed').isBoolean().withMessage('Calibration pass/fail result is required'),
  body('nextCalibrationDue').isISO8601().withMessage('Valid next calibration date is required')
];

const reservationValidation = [
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('purpose').trim().isLength({ min: 1 }).withMessage('Reservation purpose is required')
];

// Advanced instrument search with filters
router.get('/search', [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('status').optional().trim(),
  query('location.building').optional().trim(),
  query('location.room').optional().trim(),
  query('calibrationStatus').optional().isIn(['current', 'due_soon', 'overdue']),
  query('availableOnly').optional().isBoolean(),
  query('myInstruments').optional().isBoolean(),
  query('tags').optional().isArray(),
  query('sortBy').optional().isIn(['name', 'category', 'status', 'location', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const filters = { ...req.query };
    if (filters.myInstruments) {
      filters.userId = req.user.id;
    }

    const {
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    const result = await instrumentService.searchInstruments(
      filters,
      sortBy,
      sortOrder,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error searching instruments:', error);
    res.status(500).json({
      error: 'Failed to search instruments',
      message: error.message
    });
  }
});

// Get instrument details with enhanced information
router.get('/:id/details', [
  param('id').isMongoId().withMessage('Invalid instrument ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const instrument = await instrumentService.getInstrumentDetails(req.params.id);
    
    res.json({
      success: true,
      data: instrument
    });
  } catch (error) {
    logger.error('Error getting instrument details:', error);
    
    if (error.message === 'Instrument not found') {
      return res.status(404).json({
        error: 'Instrument not found'
      });
    }

    res.status(500).json({
      error: 'Failed to get instrument details',
      message: error.message
    });
  }
});

// Generate Blockly blocks for instrument
router.get('/:id/blockly-blocks', [
  param('id').isMongoId().withMessage('Invalid instrument ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const blocklyData = await instrumentService.generateBlocklyBlocks(req.params.id);
    
    res.json({
      success: true,
      data: blocklyData
    });
  } catch (error) {
    logger.error('Error generating Blockly blocks:', error);
    
    if (error.message === 'Instrument not found') {
      return res.status(404).json({
        error: 'Instrument not found'
      });
    }

    res.status(500).json({
      error: 'Failed to generate Blockly blocks',
      message: error.message
    });
  }
});

// Connect to instrument for real-time monitoring
router.post('/:id/connect', [
  param('id').isMongoId().withMessage('Invalid instrument ID'),
  body('connectionConfig').optional().isObject()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const io = req.app.get('io'); // Get Socket.IO instance
    const result = await instrumentService.connectInstrument(
      req.params.id,
      req.body.connectionConfig || {},
      io
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error connecting instrument:', error);
    res.status(500).json({
      error: 'Failed to connect instrument',
      message: error.message
    });
  }
});

// Disconnect instrument
router.post('/:id/disconnect', [
  param('id').isMongoId().withMessage('Invalid instrument ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const io = req.app.get('io');
    const result = await instrumentService.disconnectInstrument(req.params.id, io);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error disconnecting instrument:', error);
    res.status(500).json({
      error: 'Failed to disconnect instrument',
      message: error.message
    });
  }
});

// Reserve instrument
router.post('/:id/reserve', [
  param('id').isMongoId().withMessage('Invalid instrument ID'),
  ...reservationValidation
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { startTime, endTime, purpose } = req.body;
    const reservation = await instrumentService.reserveInstrument(
      req.params.id,
      req.user.id,
      startTime,
      endTime,
      purpose
    );
    
    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    logger.error('Error reserving instrument:', error);
    res.status(500).json({
      error: 'Failed to reserve instrument',
      message: error.message
    });
  }
});

// Record calibration
router.post('/:id/calibration', [
  param('id').isMongoId().withMessage('Invalid instrument ID'),
  ...calibrationValidation
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const calibrationRecord = await instrumentService.recordCalibration(
      req.params.id,
      req.body,
      req.user.id
    );
    
    res.json({
      success: true,
      data: calibrationRecord
    });
  } catch (error) {
    logger.error('Error recording calibration:', error);
    res.status(500).json({
      error: 'Failed to record calibration',
      message: error.message
    });
  }
});

// Get instrument dashboard data
router.get('/dashboard/overview', auth, async (req, res) => {
  try {
    const dashboardData = await instrumentService.getDashboardData(req.user.id);
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({
      error: 'Failed to get dashboard data',
      message: error.message
    });
  }
});

// Get instrument categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = [
      { value: 'microscope', label: 'Microscope', icon: '🔬' },
      { value: 'centrifuge', label: 'Centrifuge', icon: '🌀' },
      { value: 'incubator', label: 'Incubator', icon: '🌡️' },
      { value: 'autoclave', label: 'Autoclave', icon: '♨️' },
      { value: 'balance', label: 'Balance', icon: '⚖️' },
      { value: 'pipette', label: 'Pipette', icon: '💧' },
      { value: 'thermocycler', label: 'Thermocycler', icon: '🔄' },
      { value: 'spectrophotometer', label: 'Spectrophotometer', icon: '📊' },
      { value: 'chromatography', label: 'Chromatography', icon: '📈' },
      { value: 'electrophoresis', label: 'Electrophoresis', icon: '⚡' },
      { value: 'microplate_reader', label: 'Microplate Reader', icon: '📋' },
      { value: 'shaker', label: 'Shaker', icon: '📳' },
      { value: 'homogenizer', label: 'Homogenizer', icon: '🔀' },
      { value: 'freezer', label: 'Freezer', icon: '🧊' },
      { value: 'oven', label: 'Oven', icon: '🔥' },
      { value: 'water_bath', label: 'Water Bath', icon: '🛁' },
      { value: 'ph_meter', label: 'pH Meter', icon: '🧪' },
      { value: 'conductivity_meter', label: 'Conductivity Meter', icon: '⚡' },
      { value: 'custom', label: 'Custom', icon: '⚙️' }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error getting categories:', error);
    res.status(500).json({
      error: 'Failed to get categories',
      message: error.message
    });
  }
});

// Get instruments due for calibration
router.get('/calibration/due', [
  query('days').optional().isInt({ min: 1, max: 365 })
], auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const instruments = await Instrument.findDueForCalibration(days);
    
    res.json({
      success: true,
      data: instruments
    });
  } catch (error) {
    logger.error('Error getting instruments due for calibration:', error);
    res.status(500).json({
      error: 'Failed to get calibration schedule',
      message: error.message
    });
  }
});

// Get instruments due for maintenance
router.get('/maintenance/due', [
  query('days').optional().isInt({ min: 1, max: 365 })
], auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const instruments = await Instrument.findDueForMaintenance(days);
    
    res.json({
      success: true,
      data: instruments
    });
  } catch (error) {
    logger.error('Error getting instruments due for maintenance:', error);
    res.status(500).json({
      error: 'Failed to get maintenance schedule',
      message: error.message
    });
  }
});

// Get available instruments for reservation
router.get('/available', [
  query('startTime').optional().isISO8601(),
  query('endTime').optional().isISO8601(),
  query('category').optional().trim(),
  query('location').optional().trim()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    let query = { status: 'available', isActive: true };

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.location) {
      query['location.building'] = req.query.location;
    }

    // TODO: Add time-based availability checking
    if (req.query.startTime && req.query.endTime) {
      // Check for conflicting reservations
    }

    const instruments = await Instrument.find(query)
      .populate('owner', 'firstName lastName')
      .select('name category model location status owner');
    
    res.json({
      success: true,
      data: instruments
    });
  } catch (error) {
    logger.error('Error getting available instruments:', error);
    res.status(500).json({
      error: 'Failed to get available instruments',
      message: error.message
    });
  }
});

// Create new instrument (enhanced)
router.post('/', instrumentValidation, auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const instrumentData = {
      ...req.body,
      owner: req.user.id,
      createdBy: req.user.id
    };

    const instrument = new Instrument(instrumentData);
    await instrument.save();
    
    await instrument.populate('owner', 'firstName lastName email');

    logger.info(`Instrument created: ${instrument.name} by user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      data: instrument
    });
  } catch (error) {
    logger.error('Error creating instrument:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Instrument with this serial number already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create instrument',
      message: error.message
    });
  }
});

// Update instrument
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid instrument ID'),
  ...instrumentValidation
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
      return res.status(404).json({
        error: 'Instrument not found'
      });
    }

    // Check permissions
    if (instrument.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Not authorized to update this instrument'
      });
    }

    Object.assign(instrument, req.body);
    await instrument.save();
    
    await instrument.populate('owner', 'firstName lastName email');

    logger.info(`Instrument updated: ${instrument.name} by user ${req.user.id}`);
    
    res.json({
      success: true,
      data: instrument
    });
  } catch (error) {
    logger.error('Error updating instrument:', error);
    res.status(500).json({
      error: 'Failed to update instrument',
      message: error.message
    });
  }
});

// Delete instrument (soft delete)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid instrument ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
      return res.status(404).json({
        error: 'Instrument not found'
      });
    }

    // Check permissions
    if (instrument.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Not authorized to delete this instrument'
      });
    }

    instrument.isActive = false;
    await instrument.save();

    logger.info(`Instrument deleted: ${instrument.name} by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Instrument deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting instrument:', error);
    res.status(500).json({
      error: 'Failed to delete instrument',
      message: error.message
    });
  }
});

module.exports = router;