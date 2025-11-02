// Instrument Manager - Dynamic instrument enrollment system

class InstrumentManager {
    constructor() {
        this.instruments = new Map();
        this.customBlocks = new Map();
        this.loadDefaultInstruments();
        this.loadStoredInstruments();
    }
    
    // Load default instrument configurations
    loadDefaultInstruments() {
        // Flow Cytometers
        this.addInstrument('flow_cytometer', 'BD FACSCanto II', {
            lasers: ['405nm', '488nm', '633nm'],
            detectors: ['FSC', 'SSC', 'FITC', 'PE', 'PerCP', 'APC'],
            maxFlowRate: 10000,
            maxEvents: 1000000,
            vendor: 'BD Biosciences',
            model: 'FACSCanto II'
        });
        
        this.addInstrument('flow_cytometer', 'Beckman CytoFLEX', {
            lasers: ['405nm', '488nm', '561nm', '638nm'],
            detectors: ['FSC', 'SSC', 'FITC', 'PE', 'PE-Cy5', 'APC'],
            maxFlowRate: 80000,
            maxEvents: 10000000,
            vendor: 'Beckman Coulter',
            model: 'CytoFLEX'
        });
        
        // Mass Spectrometers
        this.addInstrument('mass_spectrometer', 'Thermo Q Exactive', {
            ionization: ['ESI'],
            analyzer: ['Orbitrap'],
            massRange: {min: 50, max: 6000},
            resolution: {min: 17500, max: 280000},
            vendor: 'Thermo Fisher Scientific',
            model: 'Q Exactive'
        });
        
        this.addInstrument('mass_spectrometer', 'Waters SYNAPT G2-Si', {
            ionization: ['ESI', 'APCI'],
            analyzer: ['Q-TOF', 'Ion Mobility'],
            massRange: {min: 50, max: 200000},
            resolution: {min: 20000, max: 40000},
            vendor: 'Waters Corporation',
            model: 'SYNAPT G2-Si'
        });
        
        // NMR Spectrometers
        this.addInstrument('nmr_spectrometer', 'Bruker AVANCE III', {
            frequencies: [400, 500, 600, 700, 800, 900],
            nuclei: ['1H', '13C', '15N', '31P', '19F'],
            experiments: ['1D', 'COSY', 'HSQC', 'NOESY', 'DEPT'],
            vendor: 'Bruker Corporation',
            model: 'AVANCE III'
        });
        
        // Liquid Handlers
        this.addInstrument('liquid_handler', 'Hamilton STAR', {
            channels: [1, 4, 8, 16],
            volumes: {min: 0.1, max: 1000},
            tipTypes: ['50μL', '200μL', '1000μL', 'filter', 'wide_bore'],
            plateFormats: [96, 384, 1536],
            vendor: 'Hamilton Company',
            model: 'STAR'
        });
        
        // qPCR Systems
        this.addInstrument('qpcr_system', 'Bio-Rad CFX96 Touch', {
            wells: 96,
            chemistry: ['SYBR Green', 'TaqMan', 'EvaGreen'],
            excitation: [450, 470, 515, 560, 610, 665],
            emission: [510, 520, 560, 580, 650, 720],
            vendor: 'Bio-Rad Laboratories',
            model: 'CFX96 Touch'
        });
    }
    
    // Add instrument to the registry
    addInstrument(type, name, config) {
        if (!this.instruments.has(type)) {
            this.instruments.set(type, new Map());
        }
        this.instruments.get(type).set(name, {
            ...config,
            dateAdded: new Date().toISOString(),
            customAdded: !this.isDefaultInstrument(name)
        });
        this.saveToStorage();
        this.updateBlockDropdowns(type);
    }
    
    // Remove instrument from registry
    removeInstrument(type, name) {
        if (this.instruments.has(type)) {
            this.instruments.get(type).delete(name);
            this.saveToStorage();
            this.updateBlockDropdowns(type);
        }
    }
    
    // Get all instruments of a specific type
    getInstruments(type) {
        return this.instruments.get(type) || new Map();
    }
    
    // Get all instrument types
    getInstrumentTypes() {
        return Array.from(this.instruments.keys());
    }
    
    // Get instrument configuration
    getInstrumentConfig(type, name) {
        const typeMap = this.instruments.get(type);
        return typeMap ? typeMap.get(name) : null;
    }
    
    // Create custom instrument block
    createCustomBlock(blockType, instrumentName, config) {
        const blockId = `${blockType}_${instrumentName.replace(/\s+/g, '_').toLowerCase()}`;
        
        // Generate block definition
        const blockDefinition = this.generateBlockDefinition(blockType, instrumentName, config);
        
        // Register the block
        Blockly.Blocks[blockId] = blockDefinition;
        
        // Generate code generators
        this.generateCodeGenerators(blockId, blockType, instrumentName, config);
        
        // Store custom block info
        this.customBlocks.set(blockId, {
            blockType,
            instrumentName,
            config,
            dateCreated: new Date().toISOString()
        });
        
        this.saveToStorage();
        return blockId;
    }
    
    // Generate dynamic block definition
    generateBlockDefinition(blockType, instrumentName, config) {
        return {
            init: function() {
                this.appendDummyInput()
                    .appendField(`${instrumentName}`)
                    .appendField(`(${config.vendor || 'Custom'})`);
                
                // Add instrument-specific inputs based on config
                if (config.sampleInput !== false) {
                    this.appendValueInput("SAMPLE")
                        .setCheck(null)
                        .appendField("sample");
                }
                
                // Add configuration-specific fields
                this.addConfigurationFields(config);
                
                // Add result storage
                this.appendDummyInput()
                    .appendField("store results as")
                    .appendField(new Blockly.FieldTextInput("results"), "RESULT_VAR");
                
                this.setInputsInline(false);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(45);
                this.setTooltip(`${instrumentName} - ${config.vendor || 'Custom instrument'}`);
                this.setHelpUrl("");
            },
            
            addConfigurationFields: function(config) {
                // Add fields based on instrument capabilities
                if (config.frequencies) {
                    this.appendDummyInput()
                        .appendField("frequency (MHz)")
                        .appendField(new Blockly.FieldDropdown(
                            config.frequencies.map(f => [f.toString(), f.toString()])
                        ), "FREQUENCY");
                }
                
                if (config.lasers) {
                    this.appendDummyInput()
                        .appendField("laser")
                        .appendField(new Blockly.FieldDropdown(
                            config.lasers.map(l => [l, l])
                        ), "LASER");
                }
                
                if (config.detectors) {
                    this.appendDummyInput()
                        .appendField("detector")
                        .appendField(new Blockly.FieldDropdown(
                            config.detectors.map(d => [d, d])
                        ), "DETECTOR");
                }
                
                if (config.chemistry) {
                    this.appendDummyInput()
                        .appendField("chemistry")
                        .appendField(new Blockly.FieldDropdown(
                            config.chemistry.map(c => [c, c])
                        ), "CHEMISTRY");
                }
                
                if (config.volumes) {
                    this.appendValueInput("VOLUME")
                        .setCheck("Number")
                        .appendField(`volume (${config.volumes.min}-${config.volumes.max} μL)`);
                }
                
                if (config.massRange) {
                    this.appendValueInput("MASS_RANGE_LOW")
                        .setCheck("Number")
                        .appendField(`mass range (${config.massRange.min}-${config.massRange.max} Da) from`);
                    this.appendValueInput("MASS_RANGE_HIGH")
                        .setCheck("Number")
                        .appendField("to");
                }
                
                // Add custom parameters
                if (config.customParameters) {
                    config.customParameters.forEach(param => {
                        if (param.type === 'dropdown') {
                            this.appendDummyInput()
                                .appendField(param.label)
                                .appendField(new Blockly.FieldDropdown(param.options), param.name);
                        } else if (param.type === 'number') {
                            this.appendValueInput(param.name.toUpperCase())
                                .setCheck("Number")
                                .appendField(param.label);
                        } else if (param.type === 'text') {
                            this.appendDummyInput()
                                .appendField(param.label)
                                .appendField(new Blockly.FieldTextInput(param.default || ""), param.name);
                        }
                    });
                }
            }
        };
    }
    
    // Generate code generators for custom blocks
    generateCodeGenerators(blockId, blockType, instrumentName, config) {
        // Python generator
        PythonGenerator[blockId] = function(block) {
            const sample = PythonGenerator.valueToCode(block, 'SAMPLE', PythonGenerator.ORDER_NONE) || 'None';
            const resultVar = block.getFieldValue('RESULT_VAR');
            
            let parameterCode = '';
            let setupCode = '';
            
            // Generate parameter extraction code
            Object.keys(config).forEach(key => {
                if (typeof config[key] === 'object' && config[key].min !== undefined) {
                    // Range parameter
                    const lowValue = PythonGenerator.valueToCode(block, `${key.toUpperCase()}_LOW`, PythonGenerator.ORDER_NONE) || config[key].min;
                    const highValue = PythonGenerator.valueToCode(block, `${key.toUpperCase()}_HIGH`, PythonGenerator.ORDER_NONE) || config[key].max;
                    parameterCode += `        print(f"  ${key}: {${lowValue}}-{${highValue}}")\\n`;
                } else if (Array.isArray(config[key])) {
                    // Dropdown parameter
                    const fieldValue = `block.getFieldValue('${key.toUpperCase()}')`;
                    parameterCode += `        print(f"  ${key}: {${fieldValue}}")\\n`;
                }
            });
            
            // Add custom parameters
            if (config.customParameters) {
                config.customParameters.forEach(param => {
                    if (param.type === 'number') {
                        const value = PythonGenerator.valueToCode(block, param.name.toUpperCase(), PythonGenerator.ORDER_NONE) || param.default || '0';
                        parameterCode += `        print(f"  ${param.label}: {${value}}")\\n`;
                    } else {
                        const value = `block.getFieldValue('${param.name.toUpperCase()}')`;
                        parameterCode += `        print(f"  ${param.label}: {${value}}")\\n`;
                    }
                });
            }
            
            const code = `
class ${instrumentName.replace(/\s+/g, '')}Step(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  ${instrumentName} Analysis")
        print(f"  Sample: {${sample}}")
${parameterCode}        
        # Simulate ${instrumentName} operation
        import time
        import numpy as np
        
        # Generate mock data based on instrument type
        ${this.generateMockDataCode(blockType, config)}
        
        result_data = {
            'instrument': '${instrumentName}',
            'vendor': '${config.vendor || 'Custom'}',
            'model': '${config.model || 'Unknown'}',
            'sample': ${sample},
            'timestamp': datetime.now().isoformat()
        }
        
        protocol.set_variable('${resultVar}', result_data)
        print(f"  Results stored in: ${resultVar}")
        return {"${resultVar}": result_data}

protocol.add_step(${instrumentName.replace(/\s+/g, '')}Step("${instrumentName}", "${instrumentName} analysis"))
`;
            
            return code;
        };
        
        // Readable generator
        ReadableGenerator[blockId] = function(block) {
            ReadableGenerator.stepCounter++;
            const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'sample';
            const resultVar = block.getFieldValue('RESULT_VAR');
            
            let output = `### Step ${ReadableGenerator.stepCounter}: ${instrumentName} Analysis\\n\\n`;
            output += `**Instrument:** ${instrumentName}\\n`;
            output += `**Vendor:** ${config.vendor || 'Custom'}\\n`;
            if (config.model) output += `**Model:** ${config.model}\\n`;
            output += `**Sample:** ${sample}\\n`;
            
            // Add configuration parameters
            Object.keys(config).forEach(key => {
                if (Array.isArray(config[key]) && config[key].length > 0) {
                    output += `**${key}:** Available options: ${config[key].join(', ')}\\n`;
                } else if (typeof config[key] === 'object' && config[key].min !== undefined) {
                    output += `**${key} range:** ${config[key].min} - ${config[key].max}\\n`;
                }
            });
            
            output += `**Store results as:** ${resultVar}\\n\\n`;
            output += `**Procedure:**\\n`;
            output += `1. Prepare ${instrumentName} for analysis\\n`;
            output += `2. Load sample: ${sample}\\n`;
            output += `3. Configure instrument parameters\\n`;
            output += `4. Execute analysis protocol\\n`;
            output += `5. Collect and process data\\n`;
            output += `6. Store results in ${resultVar}\\n\\n`;
            
            return output;
        };
    }
    
    // Generate mock data code based on instrument type
    generateMockDataCode(blockType, config) {
        switch (blockType) {
            case 'flow_cytometer':
                return `
        # Generate flow cytometry data
        events = 10000
        result_data.update({
            'events': events,
            'forward_scatter': np.random.lognormal(3, 0.5, events).tolist(),
            'side_scatter': np.random.lognormal(2.5, 0.7, events).tolist()
        })`;
            
            case 'mass_spectrometer':
                return `
        # Generate mass spectrum
        mass_range = np.arange(${config.massRange?.min || 50}, ${config.massRange?.max || 2000}, 0.1)
        intensity = np.random.exponential(0.1, len(mass_range))
        result_data.update({
            'mass_range': mass_range.tolist(),
            'intensity': intensity.tolist()
        })`;
            
            case 'qpcr_system':
                return `
        # Generate qPCR data
        ct_values = np.random.normal(25, 3, 8)
        result_data.update({
            'ct_values': ct_values.tolist(),
            'efficiency': np.random.uniform(90, 105)
        })`;
            
            default:
                return `
        # Generate generic instrument data
        result_data.update({
            'measurement': np.random.uniform(0, 100),
            'quality_score': np.random.uniform(0.8, 1.0)
        })`;
        }
    }
    
    // Update block dropdowns with new instruments
    updateBlockDropdowns(type) {
        const instruments = this.getInstruments(type);
        const options = Array.from(instruments.keys()).map(name => [name, name]);
        
        // Update existing blocks if they have instrument selection dropdowns
        if (Blockly.Blocks[type] && workspace) {
            const blocks = workspace.getBlocksByType(type);
            blocks.forEach(block => {
                const field = block.getField('INSTRUMENT');
                if (field && field instanceof Blockly.FieldDropdown) {
                    field.menuGenerator_ = options;
                }
            });
        }
    }
    
    // Check if instrument is a default one
    isDefaultInstrument(name) {
        const defaultNames = [
            'BD FACSCanto II', 'Beckman CytoFLEX', 'Thermo Q Exactive', 
            'Waters SYNAPT G2-Si', 'Bruker AVANCE III', 'Hamilton STAR', 
            'Bio-Rad CFX96 Touch'
        ];
        return defaultNames.includes(name);
    }
    
    // Save instruments to local storage
    saveToStorage() {
        const data = {
            instruments: Array.from(this.instruments.entries()).map(([type, instruments]) => [
                type, Array.from(instruments.entries())
            ]),
            customBlocks: Array.from(this.customBlocks.entries())
        };
        localStorage.setItem('protocolBuilder_instruments', JSON.stringify(data));
    }
    
    // Load instruments from local storage
    loadStoredInstruments() {
        const stored = localStorage.getItem('protocolBuilder_instruments');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                
                // Restore instruments
                if (data.instruments) {
                    data.instruments.forEach(([type, instruments]) => {
                        if (!this.instruments.has(type)) {
                            this.instruments.set(type, new Map());
                        }
                        instruments.forEach(([name, config]) => {
                            if (config.customAdded) {
                                this.instruments.get(type).set(name, config);
                            }
                        });
                    });
                }
                
                // Restore custom blocks
                if (data.customBlocks) {
                    data.customBlocks.forEach(([blockId, blockInfo]) => {
                        this.customBlocks.set(blockId, blockInfo);
                        // Recreate the block
                        this.createCustomBlock(blockInfo.blockType, blockInfo.instrumentName, blockInfo.config);
                    });
                }
            } catch (error) {
                console.warn('Error loading stored instruments:', error);
            }
        }
    }
    
    // Export instrument configurations
    exportConfiguration() {
        const config = {
            exportDate: new Date().toISOString(),
            instruments: Array.from(this.instruments.entries()).map(([type, instruments]) => [
                type, Array.from(instruments.entries()).filter(([name, config]) => config.customAdded)
            ]).filter(([type, instruments]) => instruments.length > 0),
            customBlocks: Array.from(this.customBlocks.entries())
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instrument_configuration_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Import instrument configurations
    importConfiguration(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    
                    // Import instruments
                    if (config.instruments) {
                        config.instruments.forEach(([type, instruments]) => {
                            instruments.forEach(([name, instrumentConfig]) => {
                                this.addInstrument(type, name, instrumentConfig);
                            });
                        });
                    }
                    
                    // Import custom blocks
                    if (config.customBlocks) {
                        config.customBlocks.forEach(([blockId, blockInfo]) => {
                            this.createCustomBlock(blockInfo.blockType, blockInfo.instrumentName, blockInfo.config);
                        });
                    }
                    
                    resolve('Configuration imported successfully');
                } catch (error) {
                    reject('Error parsing configuration file: ' + error.message);
                }
            };
            reader.readAsText(file);
        });
    }
}

// Global instrument manager instance
window.instrumentManager = new InstrumentManager();