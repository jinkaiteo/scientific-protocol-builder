import apiClient from './apiClient';

export interface ProtocolAnalysis {
  protocolId: string;
  protocolName: string;
  version: string;
  analyzedAt: Date;
  analysisTime: number;
  
  dependencies: DependencyAnalysis;
  validation: ValidationResults;
  resources: ResourceAnalysis;
  performance: PerformanceAnalysis;
  risks: RiskAssessment;
  optimizations: OptimizationSuggestions;
  compatibility: CompatibilityCheck;
  
  complexity: string;
  reliability: number;
  efficiency: number;
  
  criticalIssues: CriticalIssue[];
  recommendations: Recommendation[];
  
  analysisOptions: any;
  protocolMetadata: ProtocolMetadata;
}

export interface DependencyAnalysis {
  instruments: InstrumentDependency[];
  reagents: ReagentDependency[];
  protocols: ProtocolDependency[];
  data: DataDependency[];
  environmental: EnvironmentalDependency[];
  personnel: PersonnelDependency[];
  graph: DependencyGraph | null;
  criticalPath: CriticalPath[];
  parallelizable: ParallelGroup[];
  bottlenecks: Bottleneck[];
}

export interface ValidationResults {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  rules: {
    structural: RuleResult[];
    safety: RuleResult[];
    efficiency: RuleResult[];
    compliance: RuleResult[];
    resource: RuleResult[];
  };
  score: number;
  details: any;
}

export interface ResourceAnalysis {
  instruments: InstrumentRequirement[];
  reagents: ReagentRequirement[];
  consumables: ConsumableRequirement[];
  time: TimeRequirement;
  cost: CostEstimate;
  personnel: PersonnelRequirement;
  space: SpaceRequirement;
  availability: AvailabilityCheck;
}

export interface PerformanceAnalysis {
  metrics: {
    throughput: number;
    efficiency: number;
    reliability: number;
    reproducibility: number;
    scalability: number;
  };
  benchmarks: {
    industry_standard: any;
    best_practice: any;
    historical_performance: any[];
  };
  bottlenecks: PerformanceBottleneck[];
  optimization_potential: OptimizationPotential[];
  scalability_analysis: ScalabilityAnalysis;
}

export interface RiskAssessment {
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_categories: {
    safety: Risk[];
    contamination: Risk[];
    equipment_failure: Risk[];
    data_loss: Risk[];
    regulatory: Risk[];
    environmental: Risk[];
  };
  mitigation_strategies: MitigationStrategy[];
  emergency_procedures: EmergencyProcedure[];
  monitoring_points: MonitoringPoint[];
  risk_matrix: RiskMatrixItem[];
}

export interface OptimizationSuggestions {
  categories: {
    time: OptimizationSuggestion[];
    cost: OptimizationSuggestion[];
    resource: OptimizationSuggestion[];
    quality: OptimizationSuggestion[];
    safety: OptimizationSuggestion[];
    automation: OptimizationSuggestion[];
  };
  priority_ranking: PriorityRanking[];
  implementation_effort: ImplementationEffort[];
  expected_impact: ExpectedImpact[];
  trade_offs: TradeOff[];
}

export interface CompatibilityCheck {
  instruments: InstrumentCompatibility;
  protocols: ProtocolCompatibility;
  standards: StandardsCompliance;
  environments: EnvironmentCompatibility;
}

// Supporting interfaces
export interface InstrumentDependency {
  blockId: string;
  blockType: string;
  instrumentType: string;
  instrumentId?: string;
  instrument?: any;
  required: boolean;
  alternatives: any[];
  usage: any;
}

export interface DependencyGraph {
  nodes: Map<string, any>;
  edges: Map<string, any>;
  levels: any[];
  criticalPath: any[];
  parallelGroups: any[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    complexity: number;
  };
}

export interface ValidationError {
  rule: string;
  category: string;
  message: string;
  severity: string;
  location: string;
  suggestions: string[];
}

export interface ValidationWarning {
  rule: string;
  category: string;
  message: string;
  severity: string;
  location: string;
  suggestions: string[];
}

export interface ValidationSuggestion {
  rule: string;
  category: string;
  suggestion: string;
  priority: string;
}

export interface RuleResult {
  rule: string;
  passed: boolean;
  severity: string;
  message: string;
  suggestions: string[];
}

export interface CriticalIssue {
  type: string;
  severity: string;
  message: string;
  location?: string;
  category: string;
  mitigation?: string;
}

export interface Recommendation {
  type: string;
  priority: string;
  description: string;
  expected_benefit: string;
  effort?: string;
}

export interface ProtocolMetadata {
  stepCount: number;
  instrumentCount: number;
  estimatedDuration: number;
  resourceCost: number;
}

// Additional supporting interfaces
export interface InstrumentRequirement {
  type: string;
  name: string;
  quantity: number;
  duration: number;
  critical: boolean;
}

export interface ReagentRequirement {
  name: string;
  quantity: number;
  unit: string;
  concentration?: string;
  purity?: string;
}

export interface ConsumableRequirement {
  name: string;
  quantity: number;
  unit: string;
  type: string;
}

export interface TimeRequirement {
  estimated: number;
  breakdown: any[];
  criticalPath: number;
  parallelizable: number;
}

export interface CostEstimate {
  estimated: number;
  breakdown: any[];
  currency: string;
}

export interface PersonnelRequirement {
  required: number;
  skills: string[];
  workload: any[];
}

export interface SpaceRequirement {
  required: string;
  special_requirements: string[];
}

export interface AvailabilityCheck {
  instruments: any[];
  conflicts: any[];
  recommendations: any[];
}

export interface Risk {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  probability: number;
  impact: number;
  mitigation?: string;
}

export interface OptimizationSuggestion {
  strategy: string;
  category: string;
  description: string;
  expected_impact: string;
  implementation_effort: string;
  priority: string;
}

export interface AnalysisOptions {
  includeOptimizations?: boolean;
  includeRiskAssessment?: boolean;
  includeResourceAnalysis?: boolean;
  includePerformanceAnalysis?: boolean;
  validationOptions?: any;
  scheduledTime?: string;
}

export interface ComparisonResult {
  protocolIds: string[];
  comparedAt: Date;
  aspects: string[];
  results: {
    complexity: Record<string, any>;
    efficiency: Record<string, any>;
    resources: Record<string, any>;
    risks: Record<string, any>;
    recommendations: any[];
  };
}

// Additional types for batch operations
export interface BatchAnalysisResult {
  results: Array<{
    protocolId: string;
    success: boolean;
    data?: ProtocolAnalysis;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  errors: Array<{
    protocolId: string;
    error: string;
  }>;
}

class ProtocolAnalysisService {
  private baseUrl = '/api/protocol-analysis';

  /**
   * Perform comprehensive protocol analysis
   */
  async analyzeProtocol(protocolId: string, options: AnalysisOptions = {}): Promise<ProtocolAnalysis> {
    const response = await apiClient.post(`${this.baseUrl}/${protocolId}/analyze`, options);
    return response.data.data;
  }

  /**
   * Get dependency analysis only
   */
  async analyzeDependencies(
    protocolId: string,
    options: {
      includeGraph?: boolean;
      includeCriticalPath?: boolean;
      includeParallelGroups?: boolean;
    } = {}
  ): Promise<DependencyAnalysis> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await apiClient.get(`${this.baseUrl}/${protocolId}/dependencies?${params}`);
    return response.data.data;
  }

  /**
   * Validate protocol against rules
   */
  async validateProtocol(
    protocolId: string,
    options: {
      rules?: string[];
      categories?: string[];
      severity?: string;
    } = {}
  ): Promise<ValidationResults> {
    const response = await apiClient.post(`${this.baseUrl}/${protocolId}/validate`, options);
    return response.data.data;
  }

  /**
   * Analyze resource requirements
   */
  async analyzeResources(
    protocolId: string,
    options: {
      includeAvailability?: boolean;
      includeCosting?: boolean;
      scheduledTime?: string;
    } = {}
  ): Promise<ResourceAnalysis> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await apiClient.get(`${this.baseUrl}/${protocolId}/resources?${params}`);
    return response.data.data;
  }

  /**
   * Analyze protocol performance
   */
  async analyzePerformance(
    protocolId: string,
    options: {
      includeBenchmarks?: boolean;
      includeOptimization?: boolean;
    } = {}
  ): Promise<PerformanceAnalysis> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await apiClient.get(`${this.baseUrl}/${protocolId}/performance?${params}`);
    return response.data.data;
  }

  /**
   * Assess protocol risks
   */
  async assessRisks(
    protocolId: string,
    options: {
      category?: string;
      severity?: string;
    } = {}
  ): Promise<RiskAssessment> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await apiClient.get(`${this.baseUrl}/${protocolId}/risks?${params}`);
    return response.data.data;
  }

  /**
   * Get optimization suggestions
   */
  async getOptimizations(
    protocolId: string,
    options: {
      category?: string;
      priority?: string;
      maxSuggestions?: number;
    } = {}
  ): Promise<OptimizationSuggestions> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await apiClient.get(`${this.baseUrl}/${protocolId}/optimizations?${params}`);
    return response.data.data;
  }

  /**
   * Check protocol compatibility
   */
  async checkCompatibility(
    protocolId: string,
    options: {
      checkInstruments?: boolean;
      checkProtocols?: boolean;
      checkStandards?: boolean;
      checkEnvironments?: boolean;
    } = {}
  ): Promise<CompatibilityCheck> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await apiClient.get(`${this.baseUrl}/${protocolId}/compatibility?${params}`);
    return response.data.data;
  }

  /**
   * Batch analyze multiple protocols
   */
  async batchAnalyze(
    protocolIds: string[],
    analysisType: string = 'full',
    options: any = {}
  ): Promise<BatchAnalysisResult> {
    const response = await apiClient.post(`${this.baseUrl}/batch-analyze`, {
      protocolIds,
      analysisType,
      options
    });
    return response.data.data;
  }

  /**
   * Get analysis history for a protocol
   */
  async getAnalysisHistory(
    protocolId: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    protocolId: string;
    analyses: ProtocolAnalysis[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await apiClient.get(`${this.baseUrl}/${protocolId}/analysis-history?${params}`);
    return response.data.data;
  }

  /**
   * Compare multiple protocols
   */
  async compareProtocols(
    protocolIds: string[],
    options: {
      comparisonAspects?: string[];
      includeRecommendations?: boolean;
    } = {}
  ): Promise<ComparisonResult> {
    const response = await apiClient.post(`${this.baseUrl}/compare`, {
      protocolIds,
      ...options
    });
    return response.data.data;
  }

  /**
   * Get validation categories and available rules
   */
  async getValidationRules(): Promise<{
    categories: string[];
    rules: Record<string, any>;
  }> {
    // This would be implemented if the backend provides rule metadata
    return {
      categories: ['structural', 'safety', 'efficiency', 'compliance', 'resource', 'quality'],
      rules: {
        structural: ['protocol_start_block', 'protocol_end_block', 'block_connections'],
        safety: ['temperature_safety', 'chemical_compatibility', 'pressure_safety'],
        efficiency: ['redundant_steps', 'optimal_sequence', 'parallelization_opportunities'],
        compliance: ['regulatory_compliance', 'documentation_requirements'],
        resource: ['instrument_availability', 'reagent_quantities', 'time_constraints'],
        quality: ['measurement_precision', 'control_points', 'error_handling']
      }
    };
  }

  /**
   * Get optimization strategies
   */
  async getOptimizationStrategies(): Promise<{
    categories: string[];
    strategies: Record<string, string[]>;
  }> {
    return {
      categories: ['time', 'cost', 'resource', 'quality', 'safety', 'automation'],
      strategies: {
        time: ['parallel_execution', 'step_consolidation', 'automation'],
        cost: ['reagent_minimization', 'instrument_sharing', 'bulk_operations'],
        resource: ['resource_pooling', 'equipment_optimization', 'space_utilization'],
        quality: ['error_reduction', 'reproducibility', 'quality_controls'],
        safety: ['risk_mitigation', 'safety_protocols', 'emergency_procedures'],
        automation: ['workflow_automation', 'data_integration', 'monitoring']
      }
    };
  }

  /**
   * Export analysis results
   */
  async exportAnalysis(
    protocolId: string,
    format: 'json' | 'pdf' | 'csv' = 'json'
  ): Promise<Blob> {
    const response = await apiClient.get(
      `${this.baseUrl}/${protocolId}/export?format=${format}`,
      { responseType: 'blob' }
    );
    return response.data;
  }
}

// Create singleton instance
export const protocolAnalysisService = new ProtocolAnalysisService();

export default protocolAnalysisService;