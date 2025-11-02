const logger = require('../utils/logger');

/**
 * Dependency Analysis Engine for Protocol Analysis
 * Provides sophisticated dependency tracking, critical path analysis, and resource optimization
 */
class DependencyAnalysisEngine {
  constructor() {
    this.dependencyCache = new Map();
    this.graphCache = new Map();
  }

  /**
   * Build comprehensive dependency graph
   */
  buildDependencyGraph(blocks, resources = {}) {
    try {
      const graph = {
        nodes: new Map(),
        edges: new Map(),
        levels: [],
        criticalPath: [],
        parallelGroups: [],
        metadata: {
          totalNodes: 0,
          totalEdges: 0,
          maxDepth: 0,
          complexity: 0
        }
      };

      // Create nodes for each block
      blocks.forEach(block => {
        const node = {
          id: block.id,
          type: block.type,
          label: this.getBlockLabel(block),
          category: this.getBlockCategory(block.type),
          dependencies: [],
          dependents: [],
          resources: this.extractBlockResources(block),
          constraints: this.extractBlockConstraints(block),
          properties: {
            duration: this.estimateBlockDuration(block),
            criticality: this.calculateBlockCriticality(block),
            parallelizable: this.isBlockParallelizable(block),
            mandatory: this.isBlockMandatory(block)
          },
          position: { level: 0, order: 0 }
        };

        graph.nodes.set(block.id, node);
      });

      // Analyze dependencies between blocks
      this.analyzeDependencies(blocks, graph);

      // Calculate dependency levels
      this.calculateDependencyLevels(graph);

      // Identify critical path
      graph.criticalPath = this.findCriticalPath(graph);

      // Find parallel execution groups
      graph.parallelGroups = this.identifyParallelGroups(graph);

      // Calculate metadata
      graph.metadata.totalNodes = graph.nodes.size;
      graph.metadata.totalEdges = Array.from(graph.edges.values()).reduce((sum, edges) => sum + edges.length, 0);
      graph.metadata.maxDepth = Math.max(...Array.from(graph.nodes.values()).map(n => n.position.level));
      graph.metadata.complexity = this.calculateGraphComplexity(graph);

      return graph;
    } catch (error) {
      logger.error('Error building dependency graph:', error);
      throw error;
    }
  }

  /**
   * Analyze dependencies between blocks
   */
  analyzeDependencies(blocks, graph) {
    blocks.forEach(block => {
      const node = graph.nodes.get(block.id);
      if (!node) return;

      // Data flow dependencies
      this.analyzeDataFlowDependencies(block, blocks, graph);

      // Resource dependencies
      this.analyzeResourceDependencies(block, blocks, graph);

      // Temporal dependencies
      this.analyzeTemporalDependencies(block, blocks, graph);

      // Control flow dependencies
      this.analyzeControlFlowDependencies(block, blocks, graph);

      // Instrument dependencies
      this.analyzeInstrumentDependencies(block, blocks, graph);
    });
  }

  /**
   * Analyze data flow dependencies
   */
  analyzeDataFlowDependencies(block, blocks, graph) {
    const node = graph.nodes.get(block.id);
    const blockInputs = this.extractBlockInputs(block);
    const blockOutputs = this.extractBlockOutputs(block);

    // Find blocks that produce data this block needs
    blocks.forEach(otherBlock => {
      if (otherBlock.id === block.id) return;

      const otherOutputs = this.extractBlockOutputs(otherBlock);
      
      // Check if any inputs match outputs
      blockInputs.forEach(input => {
        otherOutputs.forEach(output => {
          if (this.isDataCompatible(input, output)) {
            this.addDependency(graph, otherBlock.id, block.id, {
              type: 'data_flow',
              data: {
                output: output.name,
                input: input.name,
                dataType: output.type
              }
            });
          }
        });
      });
    });
  }

  /**
   * Analyze resource dependencies
   */
  analyzeResourceDependencies(block, blocks, graph) {
    const blockResources = this.extractBlockResources(block);

    blocks.forEach(otherBlock => {
      if (otherBlock.id === block.id) return;

      const otherResources = this.extractBlockResources(otherBlock);

      // Check for shared exclusive resources
      blockResources.forEach(resource => {
        otherResources.forEach(otherResource => {
          if (this.isResourceConflicting(resource, otherResource)) {
            this.addDependency(graph, otherBlock.id, block.id, {
              type: 'resource_conflict',
              data: {
                resource: resource.name,
                conflictType: 'exclusive_access'
              }
            });
          }
        });
      });
    });
  }

  /**
   * Analyze temporal dependencies
   */
  analyzeTemporalDependencies(block, blocks, graph) {
    const blockTiming = this.extractBlockTiming(block);

    if (blockTiming.waitFor || blockTiming.after) {
      blocks.forEach(otherBlock => {
        if (this.isTemporalDependency(block, otherBlock, blockTiming)) {
          this.addDependency(graph, otherBlock.id, block.id, {
            type: 'temporal',
            data: {
              delay: blockTiming.delay || 0,
              condition: blockTiming.condition
            }
          });
        }
      });
    }
  }

  /**
   * Analyze control flow dependencies
   */
  analyzeControlFlowDependencies(block, blocks, graph) {
    // Analyze next/previous block connections
    if (block.next) {
      this.addDependency(graph, block.id, block.next, {
        type: 'control_flow',
        data: { flowType: 'sequential' }
      });
    }

    // Analyze conditional dependencies
    if (block.type.includes('controls_if')) {
      this.analyzeConditionalDependencies(block, blocks, graph);
    }

    // Analyze loop dependencies
    if (block.type.includes('controls_repeat') || block.type.includes('controls_while')) {
      this.analyzeLoopDependencies(block, blocks, graph);
    }
  }

  /**
   * Analyze instrument dependencies
   */
  analyzeInstrumentDependencies(block, blocks, graph) {
    if (!block.type.startsWith('instrument_')) return;

    const instrumentId = block.fields?.INSTRUMENT_ID;
    const instrumentType = this.extractInstrumentType(block);

    // Find other blocks using the same instrument
    blocks.forEach(otherBlock => {
      if (otherBlock.id === block.id) return;

      const otherInstrumentId = otherBlock.fields?.INSTRUMENT_ID;
      const otherInstrumentType = this.extractInstrumentType(otherBlock);

      // Same instrument instance dependency
      if (instrumentId && instrumentId === otherInstrumentId) {
        this.addDependency(graph, otherBlock.id, block.id, {
          type: 'instrument_instance',
          data: {
            instrumentId,
            conflictType: 'exclusive_access'
          }
        });
      }

      // Same instrument type dependency (if limited resources)
      if (instrumentType === otherInstrumentType && this.isInstrumentTypeLimited(instrumentType)) {
        this.addDependency(graph, otherBlock.id, block.id, {
          type: 'instrument_type',
          data: {
            instrumentType,
            conflictType: 'limited_resources'
          }
        });
      }
    });
  }

  /**
   * Calculate dependency levels for topological ordering
   */
  calculateDependencyLevels(graph) {
    const levels = [];
    const visited = new Set();
    const visiting = new Set();

    // Topological sort with level assignment
    const visit = (nodeId, level = 0) => {
      if (visiting.has(nodeId)) {
        throw new Error(`Circular dependency detected involving node ${nodeId}`);
      }
      if (visited.has(nodeId)) return;

      visiting.add(nodeId);
      const node = graph.nodes.get(nodeId);
      
      let maxDependencyLevel = -1;
      
      // Visit all dependencies first
      node.dependencies.forEach(depId => {
        visit(depId, level + 1);
        const depNode = graph.nodes.get(depId);
        maxDependencyLevel = Math.max(maxDependencyLevel, depNode.position.level);
      });

      // Set this node's level
      node.position.level = maxDependencyLevel + 1;
      
      // Ensure levels array is large enough
      while (levels.length <= node.position.level) {
        levels.push([]);
      }
      
      levels[node.position.level].push(nodeId);
      
      visiting.delete(nodeId);
      visited.add(nodeId);
    };

    // Visit all nodes
    Array.from(graph.nodes.keys()).forEach(nodeId => {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    });

    graph.levels = levels;
  }

  /**
   * Find critical path through the dependency graph
   */
  findCriticalPath(graph) {
    const criticalPath = {
      path: [],
      totalDuration: 0,
      bottlenecks: [],
      optimization_potential: []
    };

    if (graph.levels.length === 0) return criticalPath;

    // Find the longest path through the graph
    const longestPaths = new Map();
    
    // Initialize first level
    graph.levels[0].forEach(nodeId => {
      const node = graph.nodes.get(nodeId);
      longestPaths.set(nodeId, {
        duration: node.properties.duration,
        path: [nodeId]
      });
    });

    // Calculate longest paths for each subsequent level
    for (let level = 1; level < graph.levels.length; level++) {
      graph.levels[level].forEach(nodeId => {
        const node = graph.nodes.get(nodeId);
        let maxPath = { duration: 0, path: [] };

        // Find the longest path from dependencies
        node.dependencies.forEach(depId => {
          const depPath = longestPaths.get(depId);
          if (depPath && depPath.duration > maxPath.duration) {
            maxPath = depPath;
          }
        });

        longestPaths.set(nodeId, {
          duration: maxPath.duration + node.properties.duration,
          path: [...maxPath.path, nodeId]
        });
      });
    }

    // Find the overall longest path
    let maxDuration = 0;
    let maxPath = [];
    
    longestPaths.forEach((pathData, nodeId) => {
      if (pathData.duration > maxDuration) {
        maxDuration = pathData.duration;
        maxPath = pathData.path;
      }
    });

    criticalPath.path = maxPath;
    criticalPath.totalDuration = maxDuration;
    criticalPath.bottlenecks = this.identifyBottlenecksInPath(maxPath, graph);
    criticalPath.optimization_potential = this.analyzePathOptimization(maxPath, graph);

    return criticalPath;
  }

  /**
   * Identify parallel execution groups
   */
  identifyParallelGroups(graph) {
    const parallelGroups = [];

    graph.levels.forEach((level, levelIndex) => {
      if (level.length > 1) {
        const group = {
          level: levelIndex,
          nodes: [],
          potential_time_saving: 0,
          resource_conflicts: [],
          feasibility: 'high'
        };

        level.forEach(nodeId => {
          const node = graph.nodes.get(nodeId);
          group.nodes.push({
            id: nodeId,
            type: node.type,
            duration: node.properties.duration,
            resources: node.resources,
            parallelizable: node.properties.parallelizable
          });
        });

        // Calculate potential time saving
        const maxDuration = Math.max(...group.nodes.map(n => n.duration));
        const totalDuration = group.nodes.reduce((sum, n) => sum + n.duration, 0);
        group.potential_time_saving = totalDuration - maxDuration;

        // Check for resource conflicts
        group.resource_conflicts = this.checkGroupResourceConflicts(group.nodes);
        
        // Assess feasibility
        if (group.resource_conflicts.length > 0) {
          group.feasibility = 'medium';
        }
        if (group.nodes.some(n => !n.parallelizable)) {
          group.feasibility = 'low';
        }

        parallelGroups.push(group);
      }
    });

    return parallelGroups;
  }

  /**
   * Add dependency relationship
   */
  addDependency(graph, fromId, toId, metadata = {}) {
    const fromNode = graph.nodes.get(fromId);
    const toNode = graph.nodes.get(toId);

    if (!fromNode || !toNode) return;

    // Add to dependents of source node
    if (!fromNode.dependents.includes(toId)) {
      fromNode.dependents.push(toId);
    }

    // Add to dependencies of target node
    if (!toNode.dependencies.includes(fromId)) {
      toNode.dependencies.push(fromId);
    }

    // Store edge metadata
    if (!graph.edges.has(fromId)) {
      graph.edges.set(fromId, []);
    }
    
    graph.edges.get(fromId).push({
      to: toId,
      type: metadata.type || 'unknown',
      data: metadata.data || {},
      weight: metadata.weight || 1
    });
  }

  // Helper methods for extraction and analysis

  getBlockLabel(block) {
    const typeLabels = {
      'preparation_step': 'Preparation',
      'mixing_step': 'Mixing',
      'incubation_step': 'Incubation',
      'measurement_step': 'Measurement',
      'transfer_step': 'Transfer',
      'centrifuge_step': 'Centrifuge',
      'wash_step': 'Wash'
    };
    
    return typeLabels[block.type] || block.fields?.NAME || block.type || 'Unknown';
  }

  getBlockCategory(blockType) {
    if (blockType.startsWith('instrument_')) return 'instrument';
    if (blockType.startsWith('controls_')) return 'control';
    if (blockType.includes('_step')) return 'procedure';
    if (blockType.includes('variable')) return 'variable';
    return 'other';
  }

  extractBlockResources(block) {
    const resources = [];

    // Extract instrument resources
    if (block.type.startsWith('instrument_')) {
      resources.push({
        type: 'instrument',
        name: this.extractInstrumentType(block),
        id: block.fields?.INSTRUMENT_ID,
        exclusive: true,
        required: true
      });
    }

    // Extract reagent resources
    Object.entries(block.fields || {}).forEach(([key, value]) => {
      if (key.includes('REAGENT') || key.includes('CHEMICAL')) {
        resources.push({
          type: 'reagent',
          name: value,
          exclusive: false,
          required: true,
          quantity: block.fields[`${key}_AMOUNT`] || 1
        });
      }
    });

    // Extract space/environment resources
    if (this.requiresSpecialEnvironment(block)) {
      resources.push({
        type: 'environment',
        name: this.getRequiredEnvironment(block),
        exclusive: false,
        required: true
      });
    }

    return resources;
  }

  extractBlockConstraints(block) {
    const constraints = [];

    // Temperature constraints
    if (block.fields?.TEMPERATURE) {
      constraints.push({
        type: 'temperature',
        value: parseFloat(block.fields.TEMPERATURE),
        tolerance: block.fields.TEMPERATURE_TOLERANCE || 1,
        unit: 'celsius'
      });
    }

    // Time constraints
    if (block.fields?.DURATION) {
      constraints.push({
        type: 'duration',
        value: parseFloat(block.fields.DURATION),
        unit: block.fields.DURATION_UNIT || 'minutes'
      });
    }

    // Pressure constraints
    if (block.fields?.PRESSURE) {
      constraints.push({
        type: 'pressure',
        value: parseFloat(block.fields.PRESSURE),
        unit: 'bar'
      });
    }

    return constraints;
  }

  estimateBlockDuration(block) {
    // Duration from explicit field
    if (block.fields?.DURATION) {
      const duration = parseFloat(block.fields.DURATION);
      const unit = block.fields.DURATION_UNIT || 'minutes';
      
      const unitMultipliers = {
        'seconds': 1,
        'minutes': 60,
        'hours': 3600
      };
      
      return duration * (unitMultipliers[unit] || 60);
    }

    // Duration from block type
    const typeDurations = {
      'preparation_step': 300,  // 5 minutes
      'mixing_step': 120,       // 2 minutes
      'incubation_step': 1800,  // 30 minutes
      'measurement_step': 60,   // 1 minute
      'transfer_step': 30,      // 30 seconds
      'centrifuge_step': 600,   // 10 minutes
      'wash_step': 180,         // 3 minutes
      'instrument_': 300        // 5 minutes default for instruments
    };

    for (const [prefix, duration] of Object.entries(typeDurations)) {
      if (block.type.startsWith(prefix)) {
        return duration;
      }
    }

    return 60; // Default 1 minute
  }

  calculateBlockCriticality(block) {
    let criticality = 1;

    // Safety-critical blocks
    if (block.type.includes('safety') || block.type.includes('hazard')) {
      criticality += 3;
    }

    // Quality control blocks
    if (block.type.includes('quality') || block.type.includes('control')) {
      criticality += 2;
    }

    // Expensive instrument usage
    if (block.type.startsWith('instrument_')) {
      criticality += 1;
    }

    // Irreversible steps
    if (this.isIrreversibleStep(block)) {
      criticality += 2;
    }

    return Math.min(5, criticality); // Cap at 5
  }

  isBlockParallelizable(block) {
    // Safety-critical blocks typically cannot be parallelized
    if (block.type.includes('safety') || block.type.includes('emergency')) {
      return false;
    }

    // Quality control blocks may need to be sequential
    if (block.type.includes('quality_control')) {
      return false;
    }

    // Most preparation and measurement steps can be parallelized
    const parallelizableTypes = [
      'preparation_step',
      'measurement_step',
      'transfer_step'
    ];

    return parallelizableTypes.includes(block.type);
  }

  isBlockMandatory(block) {
    // All protocol steps are typically mandatory unless marked optional
    return !block.fields?.OPTIONAL || block.fields.OPTIONAL !== 'true';
  }

  extractBlockInputs(block) {
    const inputs = [];
    
    Object.entries(block.inputs || {}).forEach(([inputName, inputData]) => {
      inputs.push({
        name: inputName,
        type: this.inferDataType(inputName),
        required: true,
        source: inputData.id
      });
    });

    return inputs;
  }

  extractBlockOutputs(block) {
    const outputs = [];

    // Measurement blocks typically produce data
    if (block.type.includes('measurement')) {
      outputs.push({
        name: 'measurement_data',
        type: 'numeric',
        unit: block.fields?.UNIT || 'unknown'
      });
    }

    // Sample preparation blocks produce samples
    if (block.type.includes('preparation') || block.type.includes('transfer')) {
      outputs.push({
        name: 'sample',
        type: 'sample',
        properties: this.extractSampleProperties(block)
      });
    }

    return outputs;
  }

  isDataCompatible(input, output) {
    // Simple type matching - could be more sophisticated
    return input.type === output.type || 
           (input.type === 'any') || 
           (output.type === 'any');
  }

  isResourceConflicting(resource1, resource2) {
    return resource1.type === resource2.type &&
           resource1.name === resource2.name &&
           (resource1.exclusive || resource2.exclusive);
  }

  extractBlockTiming(block) {
    return {
      waitFor: block.fields?.WAIT_FOR,
      after: block.fields?.AFTER,
      delay: block.fields?.DELAY ? parseFloat(block.fields.DELAY) : 0,
      condition: block.fields?.CONDITION
    };
  }

  isTemporalDependency(block, otherBlock, timing) {
    if (timing.waitFor && otherBlock.fields?.NAME === timing.waitFor) {
      return true;
    }
    if (timing.after && otherBlock.id === timing.after) {
      return true;
    }
    return false;
  }

  extractInstrumentType(block) {
    if (!block.type.startsWith('instrument_')) return null;
    
    const parts = block.type.split('_');
    return parts.length > 1 ? parts[1] : null;
  }

  isInstrumentTypeLimited(instrumentType) {
    // Some instruments are typically limited in availability
    const limitedTypes = ['centrifuge', 'incubator', 'autoclave', 'microscope'];
    return limitedTypes.includes(instrumentType);
  }

  calculateGraphComplexity(graph) {
    const nodeCount = graph.nodes.size;
    const edgeCount = graph.metadata.totalEdges;
    const depth = graph.metadata.maxDepth;
    
    // Complexity metric based on nodes, edges, and depth
    return Math.round((nodeCount * 0.3) + (edgeCount * 0.4) + (depth * 0.3));
  }

  identifyBottlenecksInPath(path, graph) {
    const bottlenecks = [];
    
    path.forEach(nodeId => {
      const node = graph.nodes.get(nodeId);
      
      // High duration nodes
      if (node.properties.duration > 1800) { // > 30 minutes
        bottlenecks.push({
          nodeId,
          type: 'duration',
          severity: 'high',
          value: node.properties.duration,
          description: `Long duration step: ${node.label}`
        });
      }

      // High criticality nodes
      if (node.properties.criticality >= 4) {
        bottlenecks.push({
          nodeId,
          type: 'criticality',
          severity: 'medium',
          value: node.properties.criticality,
          description: `Critical step: ${node.label}`
        });
      }

      // Resource-intensive nodes
      if (node.resources.length > 2) {
        bottlenecks.push({
          nodeId,
          type: 'resources',
          severity: 'medium',
          value: node.resources.length,
          description: `Resource-intensive step: ${node.label}`
        });
      }
    });

    return bottlenecks;
  }

  analyzePathOptimization(path, graph) {
    const optimizations = [];
    
    // Look for consecutive nodes that could be combined
    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = graph.nodes.get(path[i]);
      const nextNode = graph.nodes.get(path[i + 1]);
      
      if (this.canCombineNodes(currentNode, nextNode)) {
        optimizations.push({
          type: 'combine_steps',
          nodes: [path[i], path[i + 1]],
          potential_saving: Math.min(currentNode.properties.duration, nextNode.properties.duration) * 0.3,
          description: `Combine ${currentNode.label} and ${nextNode.label}`
        });
      }
    }
    
    return optimizations;
  }

  checkGroupResourceConflicts(nodes) {
    const conflicts = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        node1.resources.forEach(resource1 => {
          node2.resources.forEach(resource2 => {
            if (this.isResourceConflicting(resource1, resource2)) {
              conflicts.push({
                nodes: [node1.id, node2.id],
                resource: resource1.name,
                type: resource1.type,
                severity: resource1.exclusive ? 'high' : 'medium'
              });
            }
          });
        });
      }
    }
    
    return conflicts;
  }

  // Additional helper methods

  requiresSpecialEnvironment(block) {
    const specialEnvironmentTypes = [
      'sterile_work',
      'anaerobic_work',
      'high_temperature',
      'low_temperature',
      'high_pressure'
    ];
    
    return specialEnvironmentTypes.some(type => block.type.includes(type));
  }

  getRequiredEnvironment(block) {
    if (block.type.includes('sterile')) return 'sterile_hood';
    if (block.type.includes('anaerobic')) return 'anaerobic_chamber';
    if (block.type.includes('high_temp')) return 'high_temperature_lab';
    if (block.type.includes('low_temp')) return 'cold_room';
    return 'standard_lab';
  }

  isIrreversibleStep(block) {
    const irreversibleTypes = [
      'heating',
      'chemical_reaction',
      'digest',
      'lysis',
      'destruction'
    ];
    
    return irreversibleTypes.some(type => block.type.includes(type));
  }

  inferDataType(inputName) {
    const typePatterns = {
      'temperature': 'numeric',
      'volume': 'numeric',
      'concentration': 'numeric',
      'sample': 'sample',
      'data': 'dataset',
      'result': 'result'
    };
    
    for (const [pattern, type] of Object.entries(typePatterns)) {
      if (inputName.toLowerCase().includes(pattern)) {
        return type;
      }
    }
    
    return 'any';
  }

  extractSampleProperties(block) {
    return {
      volume: block.fields?.VOLUME || 'unknown',
      concentration: block.fields?.CONCENTRATION || 'unknown',
      purity: block.fields?.PURITY || 'unknown',
      temperature: block.fields?.TEMPERATURE || 'room_temperature'
    };
  }

  canCombineNodes(node1, node2) {
    // Nodes can potentially be combined if:
    // 1. They use similar resources
    // 2. They are both preparation or measurement steps
    // 3. They don't have conflicting constraints
    
    const compatibleTypes = [
      ['preparation_step', 'mixing_step'],
      ['measurement_step', 'measurement_step'],
      ['transfer_step', 'preparation_step']
    ];
    
    return compatibleTypes.some(pair => 
      (pair.includes(node1.type) && pair.includes(node2.type)) &&
      !this.hasConflictingConstraints(node1, node2)
    );
  }

  hasConflictingConstraints(node1, node2) {
    // Check for conflicting temperature, pressure, or other constraints
    const constraints1 = node1.constraints || [];
    const constraints2 = node2.constraints || [];
    
    for (const c1 of constraints1) {
      for (const c2 of constraints2) {
        if (c1.type === c2.type && Math.abs(c1.value - c2.value) > (c1.tolerance || 0)) {
          return true;
        }
      }
    }
    
    return false;
  }

  analyzeConditionalDependencies(block, blocks, graph) {
    // Analyze if-then-else dependencies
    const conditionInput = block.inputs?.CONDITION;
    const thenBlock = block.inputs?.THEN;
    const elseBlock = block.inputs?.ELSE;
    
    if (conditionInput) {
      // Add dependency on condition source
      this.addDependency(graph, conditionInput.id, block.id, {
        type: 'conditional',
        data: { condition: 'evaluation' }
      });
    }
    
    if (thenBlock) {
      this.addDependency(graph, block.id, thenBlock.id, {
        type: 'conditional',
        data: { condition: 'then_branch' }
      });
    }
    
    if (elseBlock) {
      this.addDependency(graph, block.id, elseBlock.id, {
        type: 'conditional',
        data: { condition: 'else_branch' }
      });
    }
  }

  analyzeLoopDependencies(block, blocks, graph) {
    // Analyze loop dependencies
    const loopBody = block.inputs?.BODY;
    const loopCondition = block.inputs?.CONDITION;
    
    if (loopCondition) {
      this.addDependency(graph, loopCondition.id, block.id, {
        type: 'loop',
        data: { dependency: 'condition' }
      });
    }
    
    if (loopBody) {
      this.addDependency(graph, block.id, loopBody.id, {
        type: 'loop',
        data: { dependency: 'body' }
      });
      
      // Body depends back on loop for iteration
      this.addDependency(graph, loopBody.id, block.id, {
        type: 'loop',
        data: { dependency: 'iteration' }
      });
    }
  }
}

module.exports = new DependencyAnalysisEngine();