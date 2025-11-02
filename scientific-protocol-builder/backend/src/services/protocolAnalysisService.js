const Protocol = require('../models/Protocol');
const Instrument = require('../models/Instrument');
const logger = require('../utils/logger');

/**
 * Protocol Analysis Engine for Week 11 Implementation
 * Provides dependency analysis, validation, optimization, and intelligent insights
 */
class ProtocolAnalysisService {
  constructor() {
    this.analysisCache = new Map(); // protocolId -> analysis results
    this.dependencyGraph = new Map(); // protocolId -> dependency tree
    this.validationRules = new Map(); // rule name -> validation function
    this.optimizationStrategies = new Map(); // strategy name -> optimization function
    
    this.initializeValidationRules();
    this.initializeOptimizationStrategies();
  }

  /**
   * Comprehensive protocol analysis
   */
  async analyzeProtocol(protocolId, options = {}) {
    try {
      const protocol = await Protocol.findById(protocolId)
        .populate('createdBy', 'firstName lastName email')
        .populate('collaborators', 'firstName lastName email');

      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const analysisStart = Date.now();
      
      // Run parallel analysis components
      const [
        dependencyAnalysis,
        validationResults,
        resourceAnalysis,
        performanceAnalysis,
        riskAssessment,
        optimizationSuggestions,
        compatibilityCheck
      ] = await Promise.all([
        this.analyzeDependencies(protocol, options),
        this.validateProtocol(protocol, options),
        this.analyzeResourceRequirements(protocol, options),
        this.analyzePerformance(protocol, options),
        this.assessRisks(protocol, options),
        this.generateOptimizations(protocol, options),
        this.checkCompatibility(protocol, options)
      ]);

      const analysisTime = Date.now() - analysisStart;

      const comprehensiveAnalysis = {
        protocolId: protocol._id,
        protocolName: protocol.name,
        version: protocol.version || '1.0.0',
        analyzedAt: new Date(),
        analysisTime,
        
        // Core Analysis Results
        dependencies: dependencyAnalysis,
        validation: validationResults,
        resources: resourceAnalysis,
        performance: performanceAnalysis,
        risks: riskAssessment,
        optimizations: optimizationSuggestions,
        compatibility: compatibilityCheck,

        // Summary Metrics
        complexity: this.calculateComplexity(protocol, dependencyAnalysis),
        reliability: this.calculateReliability(validationResults, riskAssessment),
        efficiency: this.calculateEfficiency(performanceAnalysis, resourceAnalysis),
        
        // Actionable Insights
        criticalIssues: this.extractCriticalIssues(validationResults, riskAssessment),
        recommendations: this.generateRecommendations(optimizationSuggestions, validationResults),
        
        // Metadata
        analysisOptions: options,
        protocolMetadata: {
          stepCount: this.countProtocolSteps(protocol),
          instrumentCount: this.countRequiredInstruments(protocol),
          estimatedDuration: this.estimateExecutionTime(protocol),
          resourceCost: this.estimateResourceCost(protocol)
        }
      };

      // Cache results
      this.analysisCache.set(protocolId, comprehensiveAnalysis);

      return comprehensiveAnalysis;
    } catch (error) {
      logger.error('Error analyzing protocol:', error);
      throw error;
    }
  }

  /**
   * Analyze protocol dependencies
   */
  async analyzeDependencies(protocol, options = {}) {
    try {
      const dependencies = {
        instruments: [],
        reagents: [],
        protocols: [],
        data: [],
        environmental: [],
        personnel: [],
        graph: null,
        criticalPath: [],
        parallelizable: [],
        bottlenecks: []
      };

      // Parse protocol structure (assuming Blockly XML format)
      const protocolBlocks = this.parseProtocolBlocks(protocol.content);
      
      // Analyze instrument dependencies
      dependencies.instruments = await this.analyzeInstrumentDependencies(protocolBlocks);
      
      // Analyze reagent dependencies
      dependencies.reagents = this.analyzeReagentDependencies(protocolBlocks);
      
      // Analyze protocol dependencies (sub-protocols)
      dependencies.protocols = await this.analyzeProtocolDependencies(protocolBlocks);
      
      // Analyze data dependencies
      dependencies.data = this.analyzeDataDependencies(protocolBlocks);
      
      // Analyze environmental dependencies
      dependencies.environmental = this.analyzeEnvironmentalDependencies(protocolBlocks);
      
      // Analyze personnel dependencies
      dependencies.personnel = this.analyzePersonnelDependencies(protocolBlocks);
      
      // Build dependency graph
      dependencies.graph = this.buildDependencyGraph(protocolBlocks, dependencies);
      
      // Identify critical path
      dependencies.criticalPath = this.identifyCriticalPath(dependencies.graph);
      
      // Find parallelizable steps
      dependencies.parallelizable = this.identifyParallelizableSteps(dependencies.graph);
      
      // Identify bottlenecks
      dependencies.bottlenecks = this.identifyBottlenecks(dependencies.graph, dependencies.instruments);

      return dependencies;
    } catch (error) {
      logger.error('Error analyzing dependencies:', error);
      throw error;
    }
  }

  /**
   * Validate protocol against rules and constraints
   */
  async validateProtocol(protocol, options = {}) {
    try {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        rules: {
          structural: [],
          safety: [],
          efficiency: [],
          compliance: [],
          resource: []
        },
        score: 0,
        details: {}
      };

      const protocolBlocks = this.parseProtocolBlocks(protocol.content);

      // Run all validation rules
      for (const [ruleName, ruleFunction] of this.validationRules.entries()) {
        try {
          const ruleResult = await ruleFunction(protocol, protocolBlocks, options);
          
          if (ruleResult.category) {
            validation.rules[ruleResult.category].push({
              rule: ruleName,
              passed: ruleResult.passed,
              severity: ruleResult.severity || 'info',
              message: ruleResult.message,
              suggestions: ruleResult.suggestions || []
            });
          }

          if (!ruleResult.passed) {
            validation.isValid = false;
            
            if (ruleResult.severity === 'error') {
              validation.errors.push({
                rule: ruleName,
                message: ruleResult.message,
                location: ruleResult.location
              });
            } else if (ruleResult.severity === 'warning') {
              validation.warnings.push({
                rule: ruleName,
                message: ruleResult.message,
                location: ruleResult.location
              });
            }
          }

          if (ruleResult.suggestions) {
            validation.suggestions.push(...ruleResult.suggestions);
          }
        } catch (ruleError) {
          logger.error(`Validation rule ${ruleName} failed:`, ruleError);
          validation.warnings.push({
            rule: ruleName,
            message: `Validation rule failed: ${ruleError.message}`,
            location: 'unknown'
          });
        }
      }

      // Calculate validation score (0-100)
      validation.score = this.calculateValidationScore(validation.rules);

      return validation;
    } catch (error) {
      logger.error('Error validating protocol:', error);
      throw error;
    }
  }

  /**
   * Analyze resource requirements
   */
  async analyzeResourceRequirements(protocol, options = {}) {
    try {
      const resources = {
        instruments: [],
        reagents: [],
        consumables: [],
        time: {
          estimated: 0,
          breakdown: [],
          criticalPath: 0,
          parallelizable: 0
        },
        cost: {
          estimated: 0,
          breakdown: [],
          currency: 'USD'
        },
        personnel: {
          required: 1,
          skills: [],
          workload: []
        },
        space: {
          required: 'standard_lab',
          special_requirements: []
        },
        availability: {
          instruments: [],
          conflicts: [],
          recommendations: []
        }
      };

      const protocolBlocks = this.parseProtocolBlocks(protocol.content);

      // Analyze instrument requirements
      resources.instruments = await this.analyzeInstrumentRequirements(protocolBlocks);
      
      // Analyze reagent requirements
      resources.reagents = this.analyzeReagentRequirements(protocolBlocks);
      
      // Analyze consumable requirements
      resources.consumables = this.analyzeConsumableRequirements(protocolBlocks);
      
      // Estimate time requirements
      resources.time = await this.estimateTimeRequirements(protocolBlocks, resources.instruments);
      
      // Estimate costs
      resources.cost = this.estimateCosts(resources);
      
      // Analyze personnel requirements
      resources.personnel = this.analyzePersonnelRequirements(protocolBlocks, resources.instruments);
      
      // Analyze space requirements
      resources.space = this.analyzeSpaceRequirements(resources.instruments, protocolBlocks);
      
      // Check availability
      resources.availability = await this.checkResourceAvailability(resources, options.scheduledTime);

      return resources;
    } catch (error) {
      logger.error('Error analyzing resource requirements:', error);
      throw error;
    }
  }

  /**
   * Analyze protocol performance characteristics
   */
  async analyzePerformance(protocol, options = {}) {
    try {
      const performance = {
        metrics: {
          throughput: 0,
          efficiency: 0,
          reliability: 0,
          reproducibility: 0,
          scalability: 0
        },
        benchmarks: {
          industry_standard: null,
          best_practice: null,
          historical_performance: []
        },
        bottlenecks: [],
        optimization_potential: [],
        scalability_analysis: {
          parallel_steps: [],
          resource_constraints: [],
          scaling_factors: []
        }
      };

      const protocolBlocks = this.parseProtocolBlocks(protocol.content);

      // Calculate performance metrics
      performance.metrics.throughput = this.calculateThroughput(protocolBlocks);
      performance.metrics.efficiency = this.calculateEfficiencyMetric(protocolBlocks);
      performance.metrics.reliability = this.calculateReliabilityMetric(protocolBlocks);
      performance.metrics.reproducibility = this.calculateReproducibilityMetric(protocolBlocks);
      performance.metrics.scalability = this.calculateScalabilityMetric(protocolBlocks);

      // Get benchmarks
      performance.benchmarks = await this.getBenchmarks(protocol.category || 'general');

      // Identify bottlenecks
      performance.bottlenecks = this.identifyPerformanceBottlenecks(protocolBlocks);

      // Find optimization potential
      performance.optimization_potential = this.identifyOptimizationPotential(protocolBlocks);

      // Analyze scalability
      performance.scalability_analysis = this.analyzeScalability(protocolBlocks);

      return performance;
    } catch (error) {
      logger.error('Error analyzing performance:', error);
      throw error;
    }
  }

  /**
   * Assess protocol risks
   */
  async assessRisks(protocol, options = {}) {
    try {
      const risks = {
        overall_risk_level: 'low',
        risk_categories: {
          safety: [],
          contamination: [],
          equipment_failure: [],
          data_loss: [],
          regulatory: [],
          environmental: []
        },
        mitigation_strategies: [],
        emergency_procedures: [],
        monitoring_points: [],
        risk_matrix: []
      };

      const protocolBlocks = this.parseProtocolBlocks(protocol.content);

      // Assess safety risks
      risks.risk_categories.safety = this.assessSafetyRisks(protocolBlocks);
      
      // Assess contamination risks
      risks.risk_categories.contamination = this.assessContaminationRisks(protocolBlocks);
      
      // Assess equipment failure risks
      risks.risk_categories.equipment_failure = await this.assessEquipmentRisks(protocolBlocks);
      
      // Assess data loss risks
      risks.risk_categories.data_loss = this.assessDataRisks(protocolBlocks);
      
      // Assess regulatory risks
      risks.risk_categories.regulatory = this.assessRegulatoryRisks(protocolBlocks);
      
      // Assess environmental risks
      risks.risk_categories.environmental = this.assessEnvironmentalRisks(protocolBlocks);

      // Generate mitigation strategies
      risks.mitigation_strategies = this.generateMitigationStrategies(risks.risk_categories);

      // Define emergency procedures
      risks.emergency_procedures = this.defineEmergencyProcedures(risks.risk_categories);

      // Identify monitoring points
      risks.monitoring_points = this.identifyMonitoringPoints(protocolBlocks, risks.risk_categories);

      // Create risk matrix
      risks.risk_matrix = this.createRiskMatrix(risks.risk_categories);

      // Calculate overall risk level
      risks.overall_risk_level = this.calculateOverallRiskLevel(risks.risk_matrix);

      return risks;
    } catch (error) {
      logger.error('Error assessing risks:', error);
      throw error;
    }
  }

  /**
   * Generate optimization suggestions
   */
  async generateOptimizations(protocol, options = {}) {
    try {
      const optimizations = {
        categories: {
          time: [],
          cost: [],
          resource: [],
          quality: [],
          safety: [],
          automation: []
        },
        priority_ranking: [],
        implementation_effort: [],
        expected_impact: [],
        trade_offs: []
      };

      const protocolBlocks = this.parseProtocolBlocks(protocol.content);

      // Run optimization strategies
      for (const [strategyName, strategyFunction] of this.optimizationStrategies.entries()) {
        try {
          const suggestions = await strategyFunction(protocol, protocolBlocks, options);
          
          suggestions.forEach(suggestion => {
            if (suggestion.category && optimizations.categories[suggestion.category]) {
              optimizations.categories[suggestion.category].push({
                strategy: strategyName,
                ...suggestion
              });
            }
          });
        } catch (strategyError) {
          logger.error(`Optimization strategy ${strategyName} failed:`, strategyError);
        }
      }

      // Rank optimizations by priority
      optimizations.priority_ranking = this.rankOptimizations(optimizations.categories);

      // Assess implementation effort
      optimizations.implementation_effort = this.assessImplementationEffort(optimizations.categories);

      // Calculate expected impact
      optimizations.expected_impact = this.calculateExpectedImpact(optimizations.categories);

      // Identify trade-offs
      optimizations.trade_offs = this.identifyTradeOffs(optimizations.categories);

      return optimizations;
    } catch (error) {
      logger.error('Error generating optimizations:', error);
      throw error;
    }
  }

  /**
   * Check protocol compatibility
   */
  async checkCompatibility(protocol, options = {}) {
    try {
      const compatibility = {
        instruments: {
          compatible: [],
          incompatible: [],
          alternatives: []
        },
        protocols: {
          compatible: [],
          conflicts: [],
          dependencies: []
        },
        standards: {
          compliant: [],
          non_compliant: [],
          requirements: []
        },
        environments: {
          suitable: [],
          unsuitable: [],
          requirements: []
        }
      };

      const protocolBlocks = this.parseProtocolBlocks(protocol.content);

      // Check instrument compatibility
      compatibility.instruments = await this.checkInstrumentCompatibility(protocolBlocks);

      // Check protocol compatibility
      compatibility.protocols = await this.checkProtocolCompatibility(protocol);

      // Check standards compliance
      compatibility.standards = this.checkStandardsCompliance(protocolBlocks);

      // Check environment compatibility
      compatibility.environments = this.checkEnvironmentCompatibility(protocolBlocks);

      return compatibility;
    } catch (error) {
      logger.error('Error checking compatibility:', error);
      throw error;
    }
  }

  // Helper Methods

  parseProtocolBlocks(content) {
    try {
      if (typeof content === 'string') {
        // Parse Blockly XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        return this.extractBlocksFromXML(doc);
      } else if (typeof content === 'object') {
        // Already parsed JSON
        return content.blocks || [];
      }
      return [];
    } catch (error) {
      logger.error('Error parsing protocol blocks:', error);
      return [];
    }
  }

  extractBlocksFromXML(doc) {
    const blocks = [];
    const blockElements = doc.querySelectorAll('block');
    
    blockElements.forEach(blockEl => {
      const block = {
        type: blockEl.getAttribute('type'),
        id: blockEl.getAttribute('id'),
        fields: {},
        inputs: {},
        next: null,
        parent: null
      };

      // Extract fields
      blockEl.querySelectorAll('field').forEach(field => {
        block.fields[field.getAttribute('name')] = field.textContent;
      });

      // Extract inputs
      blockEl.querySelectorAll('value, statement').forEach(input => {
        const inputName = input.getAttribute('name');
        const childBlock = input.querySelector('block');
        if (childBlock) {
          block.inputs[inputName] = {
            type: childBlock.getAttribute('type'),
            id: childBlock.getAttribute('id')
          };
        }
      });

      blocks.push(block);
    });

    return blocks;
  }

  async analyzeInstrumentDependencies(blocks) {
    const instrumentDeps = [];
    const instrumentBlocks = blocks.filter(block => 
      block.type && block.type.startsWith('instrument_')
    );

    for (const block of instrumentBlocks) {
      try {
        const instrumentType = this.extractInstrumentType(block);
        const instrumentId = block.fields?.INSTRUMENT_ID;
        
        let instrument = null;
        if (instrumentId) {
          instrument = await Instrument.findById(instrumentId);
        }

        instrumentDeps.push({
          blockId: block.id,
          blockType: block.type,
          instrumentType,
          instrumentId,
          instrument: instrument ? {
            id: instrument._id,
            name: instrument.name,
            category: instrument.category,
            status: instrument.status,
            capabilities: instrument.capabilities
          } : null,
          required: true,
          alternatives: await this.findInstrumentAlternatives(instrumentType),
          usage: this.extractInstrumentUsage(block)
        });
      } catch (error) {
        logger.error('Error analyzing instrument dependency:', error);
      }
    }

    return instrumentDeps;
  }

  initializeValidationRules() {
    // Structural validation rules
    this.validationRules.set('required_start_block', this.validateStartBlock.bind(this));
    this.validationRules.set('required_end_block', this.validateEndBlock.bind(this));
    this.validationRules.set('connected_blocks', this.validateBlockConnections.bind(this));
    this.validationRules.set('orphaned_blocks', this.validateOrphanedBlocks.bind(this));
    
    // Safety validation rules
    this.validationRules.set('temperature_safety', this.validateTemperatureSafety.bind(this));
    this.validationRules.set('chemical_compatibility', this.validateChemicalCompatibility.bind(this));
    this.validationRules.set('pressure_limits', this.validatePressureLimits.bind(this));
    
    // Efficiency validation rules
    this.validationRules.set('redundant_steps', this.validateRedundantSteps.bind(this));
    this.validationRules.set('optimal_sequence', this.validateOptimalSequence.bind(this));
    
    // Resource validation rules
    this.validationRules.set('instrument_availability', this.validateInstrumentAvailability.bind(this));
    this.validationRules.set('reagent_quantities', this.validateReagentQuantities.bind(this));
  }

  initializeOptimizationStrategies() {
    // Time optimization
    this.optimizationStrategies.set('parallel_execution', this.optimizeParallelExecution.bind(this));
    this.optimizationStrategies.set('step_consolidation', this.optimizeStepConsolidation.bind(this));
    
    // Resource optimization
    this.optimizationStrategies.set('instrument_sharing', this.optimizeInstrumentSharing.bind(this));
    this.optimizationStrategies.set('reagent_minimization', this.optimizeReagentUsage.bind(this));
    
    // Quality optimization
    this.optimizationStrategies.set('error_reduction', this.optimizeErrorReduction.bind(this));
    this.optimizationStrategies.set('reproducibility', this.optimizeReproducibility.bind(this));
  }

  // Validation rule implementations
  async validateStartBlock(protocol, blocks, options) {
    const startBlocks = blocks.filter(block => 
      block.type === 'protocol_start' || block.type === 'controls_start'
    );

    return {
      passed: startBlocks.length >= 1,
      severity: startBlocks.length === 0 ? 'error' : 'info',
      category: 'structural',
      message: startBlocks.length === 0 
        ? 'Protocol must have a start block'
        : `Protocol has ${startBlocks.length} start block(s)`,
      suggestions: startBlocks.length === 0 
        ? ['Add a protocol start block to define the beginning of your protocol']
        : []
    };
  }

  async validateEndBlock(protocol, blocks, options) {
    const endBlocks = blocks.filter(block => 
      block.type === 'protocol_end' || block.type === 'controls_end'
    );

    return {
      passed: endBlocks.length >= 1,
      severity: endBlocks.length === 0 ? 'error' : 'info',
      category: 'structural',
      message: endBlocks.length === 0 
        ? 'Protocol must have an end block'
        : `Protocol has ${endBlocks.length} end block(s)`,
      suggestions: endBlocks.length === 0 
        ? ['Add a protocol end block to define the completion of your protocol']
        : []
    };
  }

  // Optimization strategy implementations
  async optimizeParallelExecution(protocol, blocks, options) {
    const suggestions = [];
    const dependencyGraph = this.buildDependencyGraph(blocks, {});
    const parallelizableSteps = this.identifyParallelizableSteps(dependencyGraph);

    if (parallelizableSteps.length > 0) {
      suggestions.push({
        category: 'time',
        type: 'parallel_execution',
        description: 'Execute independent steps in parallel to reduce total time',
        steps: parallelizableSteps,
        estimated_time_saving: this.calculateTimeSaving(parallelizableSteps),
        implementation_difficulty: 'medium',
        impact: 'high'
      });
    }

    return suggestions;
  }

  // Utility methods
  calculateComplexity(protocol, dependencies) {
    const stepCount = this.countProtocolSteps(protocol);
    const instrumentCount = dependencies.instruments.length;
    const dependencyCount = dependencies.graph ? Object.keys(dependencies.graph).length : 0;
    
    const complexity = (stepCount * 0.4) + (instrumentCount * 0.3) + (dependencyCount * 0.3);
    
    if (complexity < 10) return 'low';
    if (complexity < 25) return 'medium';
    return 'high';
  }

  calculateReliability(validation, risks) {
    let score = 100;
    
    // Deduct for validation errors/warnings
    score -= validation.errors.length * 15;
    score -= validation.warnings.length * 5;
    
    // Deduct for high-risk items
    Object.values(risks.risk_categories).forEach(category => {
      category.forEach(risk => {
        if (risk.severity === 'high') score -= 10;
        if (risk.severity === 'medium') score -= 5;
      });
    });
    
    return Math.max(0, Math.min(100, score));
  }

  calculateEfficiency(performance, resources) {
    const timeEfficiency = performance.metrics.efficiency || 50;
    const resourceEfficiency = (100 - (resources.cost.estimated / 1000)) || 50;
    
    return (timeEfficiency + resourceEfficiency) / 2;
  }

  countProtocolSteps(protocol) {
    if (!protocol.content) return 0;
    const blocks = this.parseProtocolBlocks(protocol.content);
    return blocks.filter(block => 
      !block.type.includes('controls_') && 
      !block.type.includes('variables_')
    ).length;
  }

  countRequiredInstruments(protocol) {
    const blocks = this.parseProtocolBlocks(protocol.content);
    const instrumentBlocks = blocks.filter(block => 
      block.type && block.type.startsWith('instrument_')
    );
    const uniqueInstruments = new Set(
      instrumentBlocks.map(block => this.extractInstrumentType(block))
    );
    return uniqueInstruments.size;
  }

  estimateExecutionTime(protocol) {
    const blocks = this.parseProtocolBlocks(protocol.content);
    let totalTime = 0;
    
    blocks.forEach(block => {
      // Simple time estimation based on block type
      const timeEstimates = {
        'preparation_': 300, // 5 minutes
        'mixing_': 120,     // 2 minutes
        'incubation_': 1800, // 30 minutes
        'measurement_': 60,  // 1 minute
        'transfer_': 30,     // 30 seconds
        'centrifuge_': 600,  // 10 minutes
        'wash_': 180        // 3 minutes
      };
      
      for (const [prefix, time] of Object.entries(timeEstimates)) {
        if (block.type && block.type.startsWith(prefix)) {
          totalTime += time;
          break;
        }
      }
    });
    
    return totalTime; // in seconds
  }

  estimateResourceCost(protocol) {
    // Simple cost estimation - would be more sophisticated in real implementation
    const stepCount = this.countProtocolSteps(protocol);
    const instrumentCount = this.countRequiredInstruments(protocol);
    
    return (stepCount * 10) + (instrumentCount * 50); // in USD
  }

  extractCriticalIssues(validation, risks) {
    const critical = [];
    
    // Add validation errors
    validation.errors.forEach(error => {
      critical.push({
        type: 'validation_error',
        severity: 'critical',
        message: error.message,
        location: error.location,
        category: 'structural'
      });
    });
    
    // Add high-severity risks
    Object.entries(risks.risk_categories).forEach(([category, categoryRisks]) => {
      categoryRisks.forEach(risk => {
        if (risk.severity === 'high') {
          critical.push({
            type: 'safety_risk',
            severity: 'high',
            message: risk.description,
            category: category,
            mitigation: risk.mitigation
          });
        }
      });
    });
    
    return critical;
  }

  generateRecommendations(optimizations, validation) {
    const recommendations = [];
    
    // Add high-impact optimizations
    Object.values(optimizations.categories).forEach(category => {
      category.forEach(optimization => {
        if (optimization.impact === 'high') {
          recommendations.push({
            type: 'optimization',
            priority: 'high',
            description: optimization.description,
            expected_benefit: optimization.expected_impact,
            effort: optimization.implementation_effort
          });
        }
      });
    });
    
    // Add suggestions from validation
    validation.suggestions.forEach(suggestion => {
      recommendations.push({
        type: 'validation_suggestion',
        priority: 'medium',
        description: suggestion.description || suggestion,
        expected_benefit: 'improved_reliability'
      });
    });
    
    return recommendations.slice(0, 10); // Top 10 recommendations
  }

  extractInstrumentType(block) {
    if (!block.type) return 'unknown';
    
    const parts = block.type.split('_');
    if (parts.length >= 2 && parts[0] === 'instrument') {
      return parts[1];
    }
    
    return 'unknown';
  }

  async findInstrumentAlternatives(instrumentType) {
    try {
      const alternatives = await Instrument.find({
        category: instrumentType,
        status: 'available',
        isActive: true
      }).limit(5);
      
      return alternatives.map(inst => ({
        id: inst._id,
        name: inst.name,
        model: inst.model,
        availability: inst.status
      }));
    } catch (error) {
      return [];
    }
  }

  extractInstrumentUsage(block) {
    return {
      operation: block.type,
      parameters: block.fields || {},
      duration: this.estimateBlockDuration(block),
      critical: this.isBlockCritical(block)
    };
  }

  estimateBlockDuration(block) {
    // Simple duration estimation based on block type
    const durations = {
      'centrifuge': 600,
      'incubation': 1800,
      'mixing': 120,
      'measurement': 60
    };
    
    for (const [type, duration] of Object.entries(durations)) {
      if (block.type && block.type.includes(type)) {
        return duration;
      }
    }
    
    return 60; // default 1 minute
  }

  isBlockCritical(block) {
    const criticalTypes = ['safety_', 'quality_control_', 'calibration_'];
    return criticalTypes.some(type => block.type && block.type.startsWith(type));
  }
}

module.exports = new ProtocolAnalysisService();