const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const protocolAnalysisService = require('../services/protocolAnalysisService');
const dependencyAnalysisEngine = require('../services/dependencyAnalysisEngine');
const protocolValidationEngine = require('../services/protocolValidationEngine');
const Protocol = require('../models/Protocol');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Protocol Analysis API Routes for Week 11 Implementation
 * Provides comprehensive protocol analysis, validation, and optimization
 */

// Validation middleware
const analysisOptionsValidation = [
  body('includeOptimizations').optional().isBoolean(),
  body('includeRiskAssessment').optional().isBoolean(),
  body('includeResourceAnalysis').optional().isBoolean(),
  body('includePerformanceAnalysis').optional().isBoolean(),
  body('validationOptions').optional().isObject(),
  body('scheduledTime').optional().isISO8601()
];

// Comprehensive protocol analysis
router.post('/:protocolId/analyze', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  ...analysisOptionsValidation
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { protocolId } = req.params;
    const options = {
      includeOptimizations: req.body.includeOptimizations !== false,
      includeRiskAssessment: req.body.includeRiskAssessment !== false,
      includeResourceAnalysis: req.body.includeResourceAnalysis !== false,
      includePerformanceAnalysis: req.body.includePerformanceAnalysis !== false,
      validationOptions: req.body.validationOptions || {},
      scheduledTime: req.body.scheduledTime,
      userId: req.user.id
    };

    const analysis = await protocolAnalysisService.analyzeProtocol(protocolId, options);

    res.json({
      success: true,
      data: analysis
    });

    logger.info(`Protocol ${protocolId} analyzed by user ${req.user.id}`);
  } catch (error) {
    logger.error('Error analyzing protocol:', error);
    
    if (error.message === 'Protocol not found') {
      return res.status(404).json({
        error: 'Protocol not found'
      });
    }

    res.status(500).json({
      error: 'Failed to analyze protocol',
      message: error.message
    });
  }
});

// Get dependency analysis only
router.get('/:protocolId/dependencies', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  query('includeGraph').optional().isBoolean(),
  query('includeCriticalPath').optional().isBoolean(),
  query('includeParallelGroups').optional().isBoolean()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const protocol = await Protocol.findById(req.params.protocolId);
    if (!protocol) {
      return res.status(404).json({
        error: 'Protocol not found'
      });
    }

    const options = {
      includeGraph: req.query.includeGraph !== 'false',
      includeCriticalPath: req.query.includeCriticalPath !== 'false',
      includeParallelGroups: req.query.includeParallelGroups !== 'false'
    };

    const dependencies = await protocolAnalysisService.analyzeDependencies(protocol, options);

    res.json({
      success: true,
      data: dependencies
    });
  } catch (error) {
    logger.error('Error analyzing dependencies:', error);
    res.status(500).json({
      error: 'Failed to analyze dependencies',
      message: error.message
    });
  }
});

// Get validation results only
router.post('/:protocolId/validate', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  body('rules').optional().isArray(),
  body('categories').optional().isArray(),
  body('severity').optional().isIn(['info', 'warning', 'error', 'critical'])
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const protocol = await Protocol.findById(req.params.protocolId);
    if (!protocol) {
      return res.status(404).json({
        error: 'Protocol not found'
      });
    }

    const options = {
      rules: req.body.rules,
      categories: req.body.categories,
      minSeverity: req.body.severity,
      ...req.body
    };

    const validation = await protocolAnalysisService.validateProtocol(protocol, options);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Error validating protocol:', error);
    res.status(500).json({
      error: 'Failed to validate protocol',
      message: error.message
    });
  }
});

// Get resource analysis only
router.get('/:protocolId/resources', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  query('includeAvailability').optional().isBoolean(),
  query('includeCosting').optional().isBoolean(),
  query('scheduledTime').optional().isISO8601()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const protocol = await Protocol.findById(req.params.protocolId);
    if (!protocol) {
      return res.status(404).json({
        error: 'Protocol not found'
      });
    }

    const options = {
      includeAvailability: req.query.includeAvailability !== 'false',
      includeCosting: req.query.includeCosting !== 'false',
      scheduledTime: req.query.scheduledTime
    };

    const resources = await protocolAnalysisService.analyzeResourceRequirements(protocol, options);

    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    logger.error('Error analyzing resources:', error);
    res.status(500).json({
      error: 'Failed to analyze resources',
      message: error.message
    });
  }
});

// Get performance analysis only
router.get('/:protocolId/performance', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  query('includeBenchmarks').optional().isBoolean(),
  query('includeOptimization').optional().isBoolean()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const protocol = await Protocol.findById(req.params.protocolId);
    if (!protocol) {
      return res.status(404).json({
        error: 'Protocol not found'
      });
    }

    const options = {
      includeBenchmarks: req.query.includeBenchmarks !== 'false',
      includeOptimization: req.query.includeOptimization !== 'false'
    };

    const performance = await protocolAnalysisService.analyzePerformance(protocol, options);

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Error analyzing performance:', error);
    res.status(500).json({
      error: 'Failed to analyze performance',
      message: error.message
    });
  }
});

// Get risk assessment only
router.get('/:protocolId/risks', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  query('category').optional().isIn(['safety', 'contamination', 'equipment_failure', 'data_loss', 'regulatory', 'environmental']),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const protocol = await Protocol.findById(req.params.protocolId);
    if (!protocol) {
      return res.status(404).json({
        error: 'Protocol not found'
      });
    }

    const options = {
      category: req.query.category,
      minSeverity: req.query.severity
    };

    const risks = await protocolAnalysisService.assessRisks(protocol, options);

    res.json({
      success: true,
      data: risks
    });
  } catch (error) {
    logger.error('Error assessing risks:', error);
    res.status(500).json({
      error: 'Failed to assess risks',
      message: error.message
    });
  }
});

// Get optimization suggestions only
router.get('/:protocolId/optimizations', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  query('category').optional().isIn(['time', 'cost', 'resource', 'quality', 'safety', 'automation']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('maxSuggestions').optional().isInt({ min: 1, max: 50 })
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const protocol = await Protocol.findById(req.params.protocolId);
    if (!protocol) {
      return res.status(404).json({
        error: 'Protocol not found'
      });
    }

    const options = {
      category: req.query.category,
      minPriority: req.query.priority,
      maxSuggestions: parseInt(req.query.maxSuggestions) || 10
    };

    const optimizations = await protocolAnalysisService.generateOptimizations(protocol, options);

    res.json({
      success: true,
      data: optimizations
    });
  } catch (error) {
    logger.error('Error generating optimizations:', error);
    res.status(500).json({
      error: 'Failed to generate optimizations',
      message: error.message
    });
  }
});

// Get compatibility analysis only
router.get('/:protocolId/compatibility', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  query('checkInstruments').optional().isBoolean(),
  query('checkProtocols').optional().isBoolean(),
  query('checkStandards').optional().isBoolean(),
  query('checkEnvironments').optional().isBoolean()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const protocol = await Protocol.findById(req.params.protocolId);
    if (!protocol) {
      return res.status(404).json({
        error: 'Protocol not found'
      });
    }

    const options = {
      checkInstruments: req.query.checkInstruments !== 'false',
      checkProtocols: req.query.checkProtocols !== 'false',
      checkStandards: req.query.checkStandards !== 'false',
      checkEnvironments: req.query.checkEnvironments !== 'false'
    };

    const compatibility = await protocolAnalysisService.checkCompatibility(protocol, options);

    res.json({
      success: true,
      data: compatibility
    });
  } catch (error) {
    logger.error('Error checking compatibility:', error);
    res.status(500).json({
      error: 'Failed to check compatibility',
      message: error.message
    });
  }
});

// Batch analysis for multiple protocols
router.post('/batch-analyze', [
  body('protocolIds').isArray().withMessage('Protocol IDs must be an array'),
  body('protocolIds.*').isMongoId().withMessage('Invalid protocol ID'),
  body('analysisType').optional().isIn(['dependencies', 'validation', 'resources', 'performance', 'risks', 'optimizations', 'full']),
  body('options').optional().isObject()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { protocolIds, analysisType = 'full', options = {} } = req.body;

    if (protocolIds.length > 10) {
      return res.status(400).json({
        error: 'Cannot analyze more than 10 protocols at once'
      });
    }

    const results = [];
    const errors_encountered = [];

    for (const protocolId of protocolIds) {
      try {
        let analysis;
        
        switch (analysisType) {
          case 'dependencies':
            const protocol = await Protocol.findById(protocolId);
            analysis = await protocolAnalysisService.analyzeDependencies(protocol, options);
            break;
          case 'validation':
            const protocolForValidation = await Protocol.findById(protocolId);
            analysis = await protocolAnalysisService.validateProtocol(protocolForValidation, options);
            break;
          case 'resources':
            const protocolForResources = await Protocol.findById(protocolId);
            analysis = await protocolAnalysisService.analyzeResourceRequirements(protocolForResources, options);
            break;
          case 'performance':
            const protocolForPerformance = await Protocol.findById(protocolId);
            analysis = await protocolAnalysisService.analyzePerformance(protocolForPerformance, options);
            break;
          case 'risks':
            const protocolForRisks = await Protocol.findById(protocolId);
            analysis = await protocolAnalysisService.assessRisks(protocolForRisks, options);
            break;
          case 'optimizations':
            const protocolForOptimizations = await Protocol.findById(protocolId);
            analysis = await protocolAnalysisService.generateOptimizations(protocolForOptimizations, options);
            break;
          default:
            analysis = await protocolAnalysisService.analyzeProtocol(protocolId, { ...options, userId: req.user.id });
        }

        results.push({
          protocolId,
          success: true,
          data: analysis
        });
      } catch (error) {
        errors_encountered.push({
          protocolId,
          error: error.message
        });
        
        results.push({
          protocolId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: protocolIds.length,
          successful: results.filter(r => r.success).length,
          failed: errors_encountered.length
        },
        errors: errors_encountered
      }
    });

    logger.info(`Batch analysis completed for ${protocolIds.length} protocols by user ${req.user.id}`);
  } catch (error) {
    logger.error('Error in batch analysis:', error);
    res.status(500).json({
      error: 'Failed to perform batch analysis',
      message: error.message
    });
  }
});

// Get analysis history for a protocol
router.get('/:protocolId/analysis-history', [
  param('protocolId').isMongoId().withMessage('Invalid protocol ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { protocolId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // This would typically query an analysis history collection
    // For now, we'll return cached results if available
    const cachedAnalysis = protocolAnalysisService.analysisCache.get(protocolId);
    
    const history = {
      protocolId,
      analyses: cachedAnalysis ? [cachedAnalysis] : [],
      pagination: {
        limit,
        offset,
        total: cachedAnalysis ? 1 : 0
      }
    };

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Error getting analysis history:', error);
    res.status(500).json({
      error: 'Failed to get analysis history',
      message: error.message
    });
  }
});

// Compare protocols
router.post('/compare', [
  body('protocolIds').isArray().isLength({ min: 2, max: 5 }).withMessage('Must compare 2-5 protocols'),
  body('protocolIds.*').isMongoId().withMessage('Invalid protocol ID'),
  body('comparisonAspects').optional().isArray(),
  body('includeRecommendations').optional().isBoolean()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { protocolIds, comparisonAspects = ['all'], includeRecommendations = true } = req.body;

    const comparison = {
      protocolIds,
      comparedAt: new Date(),
      aspects: comparisonAspects,
      results: {
        complexity: {},
        efficiency: {},
        resources: {},
        risks: {},
        recommendations: []
      }
    };

    // Analyze each protocol for comparison
    const analyses = [];
    for (const protocolId of protocolIds) {
      try {
        const analysis = await protocolAnalysisService.analyzeProtocol(protocolId, { userId: req.user.id });
        analyses.push({ protocolId, analysis });
      } catch (error) {
        logger.error(`Error analyzing protocol ${protocolId} for comparison:`, error);
        analyses.push({ protocolId, error: error.message });
      }
    }

    // Generate comparison metrics
    comparison.results.complexity = this.compareComplexity(analyses);
    comparison.results.efficiency = this.compareEfficiency(analyses);
    comparison.results.resources = this.compareResources(analyses);
    comparison.results.risks = this.compareRisks(analyses);

    if (includeRecommendations) {
      comparison.results.recommendations = this.generateComparisonRecommendations(analyses);
    }

    res.json({
      success: true,
      data: comparison
    });

    logger.info(`Protocol comparison completed for protocols ${protocolIds.join(', ')} by user ${req.user.id}`);
  } catch (error) {
    logger.error('Error comparing protocols:', error);
    res.status(500).json({
      error: 'Failed to compare protocols',
      message: error.message
    });
  }
});

// Helper methods for comparison (would be moved to a separate service)
function compareComplexity(analyses) {
  const complexities = {};
  analyses.forEach(({ protocolId, analysis }) => {
    if (analysis && !analysis.error) {
      complexities[protocolId] = {
        score: analysis.complexity,
        stepCount: analysis.protocolMetadata?.stepCount || 0,
        instrumentCount: analysis.protocolMetadata?.instrumentCount || 0
      };
    }
  });
  return complexities;
}

function compareEfficiency(analyses) {
  const efficiencies = {};
  analyses.forEach(({ protocolId, analysis }) => {
    if (analysis && !analysis.error) {
      efficiencies[protocolId] = {
        score: analysis.efficiency,
        estimatedDuration: analysis.protocolMetadata?.estimatedDuration || 0,
        parallelizationPotential: analysis.dependencies?.parallelizable?.length || 0
      };
    }
  });
  return efficiencies;
}

function compareResources(analyses) {
  const resources = {};
  analyses.forEach(({ protocolId, analysis }) => {
    if (analysis && !analysis.error) {
      resources[protocolId] = {
        cost: analysis.protocolMetadata?.resourceCost || 0,
        instrumentCount: analysis.protocolMetadata?.instrumentCount || 0,
        estimatedTime: analysis.protocolMetadata?.estimatedDuration || 0
      };
    }
  });
  return resources;
}

function compareRisks(analyses) {
  const risks = {};
  analyses.forEach(({ protocolId, analysis }) => {
    if (analysis && !analysis.error) {
      risks[protocolId] = {
        overallLevel: analysis.risks?.overall_risk_level || 'unknown',
        criticalIssues: analysis.criticalIssues?.length || 0,
        riskCategories: Object.keys(analysis.risks?.risk_categories || {}).length
      };
    }
  });
  return risks;
}

function generateComparisonRecommendations(analyses) {
  const recommendations = [];
  
  // Find best performing protocol in each category
  let mostEfficient = null;
  let leastRisky = null;
  let mostCostEffective = null;
  
  analyses.forEach(({ protocolId, analysis }) => {
    if (analysis && !analysis.error) {
      if (!mostEfficient || analysis.efficiency > mostEfficient.efficiency) {
        mostEfficient = { protocolId, efficiency: analysis.efficiency };
      }
      
      if (!leastRisky || (analysis.risks?.overall_risk_level === 'low' && leastRisky.riskLevel !== 'low')) {
        leastRisky = { protocolId, riskLevel: analysis.risks?.overall_risk_level };
      }
      
      const cost = analysis.protocolMetadata?.resourceCost || Infinity;
      if (!mostCostEffective || cost < mostCostEffective.cost) {
        mostCostEffective = { protocolId, cost };
      }
    }
  });

  if (mostEfficient) {
    recommendations.push({
      type: 'efficiency',
      message: `Protocol ${mostEfficient.protocolId} shows highest efficiency`,
      protocolId: mostEfficient.protocolId
    });
  }

  if (leastRisky) {
    recommendations.push({
      type: 'safety',
      message: `Protocol ${leastRisky.protocolId} has the lowest risk profile`,
      protocolId: leastRisky.protocolId
    });
  }

  if (mostCostEffective) {
    recommendations.push({
      type: 'cost',
      message: `Protocol ${mostCostEffective.protocolId} is most cost-effective`,
      protocolId: mostCostEffective.protocolId
    });
  }

  return recommendations;
}

module.exports = router;