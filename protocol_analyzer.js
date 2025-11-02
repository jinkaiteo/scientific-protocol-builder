// Protocol analyzer for analyzing inputs, outputs, and intermediate variables

const ProtocolAnalyzer = {
    analyze: function(workspace) {
        const analysis = {
            inputs: [],
            intermediates: [],
            outputs: [],
            stepCount: 0,
            controlFlow: [],
            warnings: []
        };
        
        const allBlocks = workspace.getAllBlocks();
        const variables = new Set();
        const definedVariables = new Set();
        const usedVariables = new Set();
        
        // First pass: collect all variable definitions and usage
        allBlocks.forEach(block => {
            this.analyzeBlock(block, analysis, variables, definedVariables, usedVariables);
        });
        
        // Second pass: categorize variables
        this.categorizeVariables(analysis, variables, definedVariables, usedVariables);
        
        // Check for potential issues
        this.checkForIssues(analysis, definedVariables, usedVariables);
        
        return analysis;
    },
    
    analyzeBlock: function(block, analysis, variables, definedVariables, usedVariables) {
        const blockType = block.type;
        
        // Count steps
        if (this.isExperimentStep(blockType)) {
            analysis.stepCount++;
        }
        
        // Track control flow
        if (this.isControlFlow(blockType)) {
            analysis.controlFlow.push(this.getControlFlowDescription(block));
        }
        
        // Track variable definitions
        if (this.isVariableDefinition(blockType)) {
            const varInfo = this.extractVariableInfo(block);
            if (varInfo) {
                variables.add(varInfo);
                definedVariables.add(varInfo.name);
            }
        }
        
        // Track variable usage
        this.extractVariableUsage(block, usedVariables);
        
        // Track protocol inputs/outputs
        if (blockType === 'protocol_input') {
            analysis.inputs.push(this.extractProtocolInput(block));
        } else if (blockType === 'protocol_output') {
            analysis.outputs.push(this.extractProtocolOutput(block));
        }
    },
    
    isExperimentStep: function(blockType) {
        const stepTypes = [
            'preparation_step', 'mixing_step', 'incubation_step', 'measurement_step',
            'transfer_step', 'centrifuge_step', 'wash_step', 'observation_step'
        ];
        return stepTypes.includes(blockType);
    },
    
    isControlFlow: function(blockType) {
        const controlTypes = [
            'controls_if', 'controls_repeat_ext', 'controls_whileUntil', 'controls_for',
            'protocol_sequence', 'parallel_steps', 'conditional_step'
        ];
        return controlTypes.includes(blockType);
    },
    
    getControlFlowDescription: function(block) {
        const blockType = block.type;
        
        switch (blockType) {
            case 'controls_if':
                return 'Conditional execution (if-then-else)';
            case 'controls_repeat_ext':
                const times = this.getFieldValueOrDefault(block, 'TIMES', 'N');
                return `Loop (repeat ${times} times)`;
            case 'controls_whileUntil':
                const mode = block.getFieldValue('MODE');
                return `Loop (${mode} condition is met)`;
            case 'controls_for':
                return 'For loop (iterate through range)';
            case 'protocol_sequence':
                const seqName = this.getFieldValueOrDefault(block, 'NAME', 'unnamed sequence');
                return `Protocol sequence: ${seqName}`;
            case 'parallel_steps':
                return 'Parallel execution of multiple branches';
            case 'conditional_step':
                return 'Conditional step execution';
            default:
                return `Control flow: ${blockType}`;
        }
    },
    
    isVariableDefinition: function(blockType) {
        const varTypes = [
            'sample_variable', 'reagent_variable', 'equipment_variable', 'parameter_variable'
        ];
        return varTypes.includes(blockType);
    },
    
    extractVariableInfo: function(block) {
        const blockType = block.type;
        const name = this.getFieldValueOrDefault(block, 'NAME', 'unnamed');
        
        switch (blockType) {
            case 'sample_variable':
                return {
                    name: name,
                    type: 'sample',
                    subtype: this.getFieldValueOrDefault(block, 'TYPE', 'unknown'),
                    description: this.getFieldValueOrDefault(block, 'DESCRIPTION', 'Sample for experiment'),
                    properties: {
                        volume: this.getInputValue(block, 'VOLUME'),
                        concentration: this.getInputValue(block, 'CONCENTRATION')
                    }
                };
                
            case 'reagent_variable':
                return {
                    name: name,
                    type: 'reagent',
                    subtype: 'chemical',
                    description: this.getFieldValueOrDefault(block, 'DESCRIPTION', 'Chemical reagent'),
                    properties: {
                        concentration: this.getInputValue(block, 'CONCENTRATION'),
                        units: this.getFieldValueOrDefault(block, 'UNITS', ''),
                        volume: this.getInputValue(block, 'VOLUME'),
                        storage: this.getFieldValueOrDefault(block, 'STORAGE', 'RT')
                    }
                };
                
            case 'equipment_variable':
                return {
                    name: name,
                    type: 'equipment',
                    subtype: this.getFieldValueOrDefault(block, 'TYPE', 'unknown'),
                    description: `${this.getFieldValueOrDefault(block, 'TYPE', 'Equipment')} for experiment`,
                    properties: {
                        model: this.getFieldValueOrDefault(block, 'MODEL', ''),
                        settings: this.getFieldValueOrDefault(block, 'SETTINGS', '')
                    }
                };
                
            case 'parameter_variable':
                return {
                    name: name,
                    type: 'parameter',
                    subtype: this.getFieldValueOrDefault(block, 'TYPE', 'unknown'),
                    description: this.getFieldValueOrDefault(block, 'DESCRIPTION', 'Experimental parameter'),
                    properties: {
                        value: this.getInputValue(block, 'VALUE'),
                        units: this.getFieldValueOrDefault(block, 'UNITS', '')
                    }
                };
                
            default:
                return null;
        }
    },
    
    extractVariableUsage: function(block, usedVariables) {
        // Check get_variable blocks
        if (block.type === 'get_variable') {
            const varName = this.getFieldValueOrDefault(block, 'VAR_NAME', '');
            if (varName) {
                usedVariables.add(varName);
            }
        }
        
        // Check set_variable blocks
        if (block.type === 'set_variable') {
            const varName = this.getFieldValueOrDefault(block, 'VAR_NAME', '');
            if (varName) {
                usedVariables.add(varName);
            }
        }
        
        // Check measurement steps that create result variables
        if (block.type === 'measurement_step') {
            const resultVar = this.getFieldValueOrDefault(block, 'RESULT_VAR', '');
            if (resultVar) {
                usedVariables.add(resultVar);
            }
        }
        
        // Check observation steps that create record variables
        if (block.type === 'observation_step') {
            const recordVar = this.getFieldValueOrDefault(block, 'RECORD_VAR', '');
            if (recordVar) {
                usedVariables.add(recordVar);
            }
        }
    },
    
    extractProtocolInput: function(block) {
        return {
            name: this.getFieldValueOrDefault(block, 'INPUT_NAME', 'unnamed_input'),
            type: this.getFieldValueOrDefault(block, 'INPUT_TYPE', 'unknown'),
            required: block.getFieldValue('REQUIRED') === 'TRUE',
            defaultValue: this.getInputValue(block, 'DEFAULT_VALUE'),
            description: this.getFieldValueOrDefault(block, 'DESCRIPTION', 'Protocol input parameter')
        };
    },
    
    extractProtocolOutput: function(block) {
        return {
            name: this.getFieldValueOrDefault(block, 'OUTPUT_NAME', 'unnamed_output'),
            type: this.getFieldValueOrDefault(block, 'OUTPUT_TYPE', 'unknown'),
            value: this.getInputValue(block, 'VALUE'),
            description: this.getFieldValueOrDefault(block, 'DESCRIPTION', 'Protocol output result')
        };
    },
    
    categorizeVariables: function(analysis, variables, definedVariables, usedVariables) {
        variables.forEach(variable => {
            const isUsed = usedVariables.has(variable.name);
            const isInput = analysis.inputs.some(input => input.name === variable.name);
            const isOutput = analysis.outputs.some(output => output.name === variable.name);
            
            if (isInput) {
                // Already in inputs
            } else if (isOutput) {
                // Already in outputs
            } else if (isUsed) {
                analysis.intermediates.push(variable);
            } else {
                // Unused variable - add to intermediates with warning
                analysis.intermediates.push(variable);
                analysis.warnings.push(`Variable '${variable.name}' is defined but never used`);
            }
        });
        
        // Check for used but undefined variables
        usedVariables.forEach(varName => {
            if (!definedVariables.has(varName) && 
                !analysis.inputs.some(input => input.name === varName) &&
                !analysis.outputs.some(output => output.name === varName)) {
                analysis.warnings.push(`Variable '${varName}' is used but never defined`);
            }
        });
    },
    
    checkForIssues: function(analysis, definedVariables, usedVariables) {
        // Check if protocol has no steps
        if (analysis.stepCount === 0) {
            analysis.warnings.push('Protocol contains no experimental steps');
        }
        
        // Check if protocol has no inputs
        if (analysis.inputs.length === 0 && definedVariables.size === 0) {
            analysis.warnings.push('Protocol has no inputs or defined variables');
        }
        
        // Check if protocol has no outputs
        if (analysis.outputs.length === 0) {
            analysis.warnings.push('Protocol has no defined outputs');
        }
        
        // Check for very long protocols
        if (analysis.stepCount > 20) {
            analysis.warnings.push('Protocol is very long (>20 steps) - consider breaking into sub-protocols');
        }
        
        // Check for required inputs without defaults
        analysis.inputs.forEach(input => {
            if (input.required && !input.defaultValue) {
                analysis.warnings.push(`Required input '${input.name}' has no default value`);
            }
        });
    },
    
    // Helper functions
    getFieldValueOrDefault: function(block, fieldName, defaultValue) {
        try {
            const value = block.getFieldValue(fieldName);
            return value || defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    
    getInputValue: function(block, inputName) {
        try {
            const input = block.getInput(inputName);
            if (input && input.connection && input.connection.targetBlock()) {
                const targetBlock = input.connection.targetBlock();
                if (targetBlock.type === 'math_number') {
                    return targetBlock.getFieldValue('NUM');
                } else if (targetBlock.type === 'text') {
                    return targetBlock.getFieldValue('TEXT');
                } else if (targetBlock.type === 'logic_boolean') {
                    return targetBlock.getFieldValue('BOOL') === 'TRUE';
                }
                return 'connected block';
            }
            return null;
        } catch (e) {
            return null;
        }
    }
};