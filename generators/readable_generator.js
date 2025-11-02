// Readable format generator for scientific protocols

const ReadableGenerator = new Blockly.Generator('Readable');

// Initialize generator
ReadableGenerator.init = function(workspace) {
    ReadableGenerator.definitions_ = {};
    ReadableGenerator.stepCounter = 0;
    ReadableGenerator.sectionCounter = 0;
    ReadableGenerator.materials = [];
    ReadableGenerator.equipment = [];
    ReadableGenerator.reagents = [];
    ReadableGenerator.samples = [];
};

// Finish code generation
ReadableGenerator.finish = function(code) {
    let output = "# EXPERIMENTAL PROTOCOL\n\n";
    
    // Add protocol header
    if (ReadableGenerator.protocolName) {
        output += `## Protocol: ${ReadableGenerator.protocolName}\n\n`;
    }
    
    if (ReadableGenerator.protocolDescription) {
        output += `**Description:** ${ReadableGenerator.protocolDescription}\n\n`;
    }
    
    // Add materials section
    if (ReadableGenerator.materials.length > 0 || 
        ReadableGenerator.reagents.length > 0 || 
        ReadableGenerator.samples.length > 0 ||
        ReadableGenerator.equipment.length > 0) {
        
        output += "## MATERIALS AND REAGENTS\n\n";
        
        if (ReadableGenerator.samples.length > 0) {
            output += "### Samples:\n";
            ReadableGenerator.samples.forEach(sample => {
                output += `- **${sample.name}** (${sample.type}): ${sample.description}\n`;
                if (sample.volume) output += `  - Volume: ${sample.volume} μL\n`;
                if (sample.concentration) output += `  - Concentration: ${sample.concentration}\n`;
            });
            output += "\n";
        }
        
        if (ReadableGenerator.reagents.length > 0) {
            output += "### Reagents:\n";
            ReadableGenerator.reagents.forEach(reagent => {
                output += `- **${reagent.name}**: ${reagent.concentration} ${reagent.units}\n`;
                if (reagent.description) output += `  - ${reagent.description}\n`;
                if (reagent.storage) output += `  - Storage: ${reagent.storage}\n`;
            });
            output += "\n";
        }
        
        if (ReadableGenerator.equipment.length > 0) {
            output += "### Equipment:\n";
            ReadableGenerator.equipment.forEach(equipment => {
                output += `- **${equipment.name}** (${equipment.type})\n`;
                if (equipment.model) output += `  - Model: ${equipment.model}\n`;
                if (equipment.settings) output += `  - Settings: ${equipment.settings}\n`;
            });
            output += "\n";
        }
    }
    
    // Add procedure section
    output += "## PROCEDURE\n\n";
    output += code;
    
    // Add safety notes
    output += "\n## SAFETY NOTES\n\n";
    output += "- Follow standard laboratory safety protocols\n";
    output += "- Wear appropriate personal protective equipment (PPE)\n";
    output += "- Handle all reagents according to their safety data sheets\n";
    output += "- Dispose of waste according to institutional guidelines\n\n";
    
    // Add quality control
    output += "## QUALITY CONTROL\n\n";
    output += "- Record all measurements and observations\n";
    output += "- Check equipment calibration before use\n";
    output += "- Include appropriate controls in the experiment\n";
    output += "- Document any deviations from the protocol\n\n";
    
    return output;
};

// Variable blocks
ReadableGenerator['sample_variable'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    const volume = ReadableGenerator.valueToCode(block, 'VOLUME', ReadableGenerator.ORDER_NONE) || 'unspecified';
    const concentration = ReadableGenerator.valueToCode(block, 'CONCENTRATION', ReadableGenerator.ORDER_NONE) || 'unspecified';
    const description = block.getFieldValue('DESCRIPTION') || 'No description provided';
    
    ReadableGenerator.samples.push({
        name: name,
        type: type,
        volume: volume,
        concentration: concentration,
        description: description
    });
    
    return `Sample ${name} prepared (${type}, ${volume} μL, concentration: ${concentration})\n`;
};

ReadableGenerator['reagent_variable'] = function(block) {
    const name = block.getFieldValue('NAME');
    const concentration = ReadableGenerator.valueToCode(block, 'CONCENTRATION', ReadableGenerator.ORDER_NONE) || 'unspecified';
    const units = block.getFieldValue('UNITS');
    const volume = ReadableGenerator.valueToCode(block, 'VOLUME', ReadableGenerator.ORDER_NONE) || 'unspecified';
    const storage = block.getFieldValue('STORAGE');
    const description = block.getFieldValue('DESCRIPTION') || 'No description provided';
    
    ReadableGenerator.reagents.push({
        name: name,
        concentration: concentration,
        units: units,
        volume: volume,
        storage: storage,
        description: description
    });
    
    return `Reagent ${name} prepared (${concentration} ${units}, ${volume} μL, stored at ${storage})\n`;
};

ReadableGenerator['equipment_variable'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    const model = block.getFieldValue('MODEL') || 'unspecified model';
    const settings = block.getFieldValue('SETTINGS') || 'default settings';
    
    ReadableGenerator.equipment.push({
        name: name,
        type: type,
        model: model,
        settings: settings
    });
    
    return `Equipment ${name} (${type}) set up with ${settings}\n`;
};

ReadableGenerator['parameter_variable'] = function(block) {
    const name = block.getFieldValue('NAME');
    const value = ReadableGenerator.valueToCode(block, 'VALUE', ReadableGenerator.ORDER_NONE) || 'unspecified';
    const type = block.getFieldValue('TYPE');
    const units = block.getFieldValue('UNITS') || '';
    const description = block.getFieldValue('DESCRIPTION') || 'No description provided';
    
    return `Parameter ${name}: ${value} ${units} (${description})\n`;
};

ReadableGenerator['get_variable'] = function(block) {
    const varName = block.getFieldValue('VAR_NAME');
    return [`${varName}`, ReadableGenerator.ORDER_ATOMIC];
};

ReadableGenerator['set_variable'] = function(block) {
    const varName = block.getFieldValue('VAR_NAME');
    const value = ReadableGenerator.valueToCode(block, 'VALUE', ReadableGenerator.ORDER_NONE) || 'unspecified value';
    return `Set ${varName} to ${value}\n`;
};

// Experiment step blocks
ReadableGenerator['preparation_step'] = function(block) {
    ReadableGenerator.stepCounter++;
    const what = block.getFieldValue('WHAT');
    const method = block.getFieldValue('METHOD');
    const materials = ReadableGenerator.valueToCode(block, 'MATERIALS', ReadableGenerator.ORDER_NONE) || 'standard materials';
    const conditions = ReadableGenerator.valueToCode(block, 'CONDITIONS', ReadableGenerator.ORDER_NONE) || 'standard conditions';
    const substeps = ReadableGenerator.statementToCode(block, 'SUBSTEPS');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Preparation\n\n`;
    output += `**Prepare:** ${what}\n`;
    output += `**Method:** ${method}\n`;
    output += `**Materials:** ${materials}\n`;
    output += `**Conditions:** ${conditions}\n\n`;
    
    if (substeps) {
        output += "**Detailed steps:**\n";
        output += ReadableGenerator.prefixLines(substeps, "  ");
        output += "\n";
    }
    
    return output;
};

ReadableGenerator['mixing_step'] = function(block) {
    ReadableGenerator.stepCounter++;
    const components = block.getFieldValue('COMPONENTS');
    const volume = ReadableGenerator.valueToCode(block, 'VOLUME', ReadableGenerator.ORDER_NONE) || 'appropriate volume';
    const speed = ReadableGenerator.valueToCode(block, 'SPEED', ReadableGenerator.ORDER_NONE) || 'appropriate speed';
    const time = ReadableGenerator.valueToCode(block, 'TIME', ReadableGenerator.ORDER_NONE) || 'appropriate time';
    const method = block.getFieldValue('METHOD');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Mixing\n\n`;
    output += `**Mix:** ${components}\n`;
    output += `**Volume:** ${volume} μL\n`;
    output += `**Method:** ${method}\n`;
    output += `**Speed:** ${speed} rpm\n`;
    output += `**Duration:** ${time} minutes\n\n`;
    
    return output;
};

ReadableGenerator['incubation_step'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = block.getFieldValue('SAMPLE');
    const temperature = ReadableGenerator.valueToCode(block, 'TEMPERATURE', ReadableGenerator.ORDER_NONE) || 'room temperature';
    const time = ReadableGenerator.valueToCode(block, 'TIME', ReadableGenerator.ORDER_NONE) || 'appropriate time';
    const conditions = block.getFieldValue('CONDITIONS');
    const humidity = ReadableGenerator.valueToCode(block, 'HUMIDITY', ReadableGenerator.ORDER_NONE) || 'ambient humidity';
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Incubation\n\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**Temperature:** ${temperature}°C\n`;
    output += `**Duration:** ${time} minutes\n`;
    output += `**Conditions:** ${conditions}\n`;
    output += `**Humidity:** ${humidity}%\n\n`;
    
    return output;
};

ReadableGenerator['measurement_step'] = function(block) {
    ReadableGenerator.stepCounter++;
    const measurementType = block.getFieldValue('MEASUREMENT_TYPE');
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'sample';
    const wavelength = ReadableGenerator.valueToCode(block, 'WAVELENGTH', ReadableGenerator.ORDER_NONE) || 'appropriate wavelength';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Measurement\n\n`;
    output += `**Measurement type:** ${measurementType}\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**Wavelength:** ${wavelength} nm\n`;
    output += `**Record result as:** ${resultVar}\n\n`;
    
    return output;
};

ReadableGenerator['transfer_step'] = function(block) {
    ReadableGenerator.stepCounter++;
    const source = ReadableGenerator.valueToCode(block, 'SOURCE', ReadableGenerator.ORDER_NONE) || 'source container';
    const destination = ReadableGenerator.valueToCode(block, 'DESTINATION', ReadableGenerator.ORDER_NONE) || 'destination container';
    const volume = ReadableGenerator.valueToCode(block, 'VOLUME', ReadableGenerator.ORDER_NONE) || 'appropriate volume';
    const method = block.getFieldValue('METHOD');
    const tipType = block.getFieldValue('TIP_TYPE');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Transfer\n\n`;
    output += `**Transfer from:** ${source}\n`;
    output += `**Transfer to:** ${destination}\n`;
    output += `**Volume:** ${volume} μL\n`;
    output += `**Method:** ${method}\n`;
    output += `**Tip type:** ${tipType}\n\n`;
    
    return output;
};

ReadableGenerator['centrifuge_step'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'sample';
    const speed = ReadableGenerator.valueToCode(block, 'SPEED', ReadableGenerator.ORDER_NONE) || 'appropriate speed';
    const time = ReadableGenerator.valueToCode(block, 'TIME', ReadableGenerator.ORDER_NONE) || 'appropriate time';
    const temperature = ReadableGenerator.valueToCode(block, 'TEMPERATURE', ReadableGenerator.ORDER_NONE) || 'room temperature';
    const acceleration = block.getFieldValue('ACCELERATION');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Centrifugation\n\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**Speed:** ${speed} rpm\n`;
    output += `**Duration:** ${time} minutes\n`;
    output += `**Temperature:** ${temperature}°C\n`;
    output += `**Acceleration:** ${acceleration}\n\n`;
    
    return output;
};

ReadableGenerator['wash_step'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'sample';
    const buffer = ReadableGenerator.valueToCode(block, 'BUFFER', ReadableGenerator.ORDER_NONE) || 'wash buffer';
    const volume = ReadableGenerator.valueToCode(block, 'VOLUME', ReadableGenerator.ORDER_NONE) || 'appropriate volume';
    const cycles = ReadableGenerator.valueToCode(block, 'CYCLES', ReadableGenerator.ORDER_NONE) || '3';
    const method = block.getFieldValue('METHOD');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Washing\n\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**Wash buffer:** ${buffer}\n`;
    output += `**Volume per wash:** ${volume} μL\n`;
    output += `**Number of cycles:** ${cycles}\n`;
    output += `**Method:** ${method}\n\n`;
    
    return output;
};

ReadableGenerator['observation_step'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = block.getFieldValue('SAMPLE');
    const observation = block.getFieldValue('OBSERVATION');
    const recordVar = block.getFieldValue('RECORD_VAR');
    const time = ReadableGenerator.valueToCode(block, 'TIME', ReadableGenerator.ORDER_NONE) || '5';
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Observation\n\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**Observe:** ${observation}\n`;
    output += `**Observation time:** ${time} minutes\n`;
    output += `**Record as:** ${recordVar}\n\n`;
    
    return output;
};

// Control flow blocks
ReadableGenerator['controls_if'] = function(block) {
    let n = 0;
    let output = '';
    let branchCode, conditionCode;
    
    do {
        conditionCode = ReadableGenerator.valueToCode(block, 'IF' + n, ReadableGenerator.ORDER_NONE) || 'condition';
        branchCode = ReadableGenerator.statementToCode(block, 'DO' + n);
        
        if (n === 0) {
            output += `**If** ${conditionCode}, **then:**\n\n`;
        } else {
            output += `**Else if** ${conditionCode}, **then:**\n\n`;
        }
        
        output += ReadableGenerator.prefixLines(branchCode, "  ");
        ++n;
    } while (block.getInput('IF' + n));
    
    if (block.getInput('ELSE')) {
        branchCode = ReadableGenerator.statementToCode(block, 'ELSE');
        output += `**Otherwise:**\n\n`;
        output += ReadableGenerator.prefixLines(branchCode, "  ");
    }
    
    return output + "\n";
};

ReadableGenerator['controls_repeat_ext'] = function(block) {
    const times = ReadableGenerator.valueToCode(block, 'TIMES', ReadableGenerator.ORDER_NONE) || 'N';
    const branch = ReadableGenerator.statementToCode(block, 'DO');
    
    let output = `**Repeat** ${times} **times:**\n\n`;
    output += ReadableGenerator.prefixLines(branch, "  ");
    output += "\n";
    
    return output;
};

ReadableGenerator['protocol_definition'] = function(block) {
    const protocolName = block.getFieldValue('PROTOCOL_NAME');
    const description = block.getFieldValue('DESCRIPTION');
    const inputs = ReadableGenerator.statementToCode(block, 'INPUTS');
    const steps = ReadableGenerator.statementToCode(block, 'STEPS');
    const outputs = ReadableGenerator.statementToCode(block, 'OUTPUTS');
    
    ReadableGenerator.protocolName = protocolName;
    ReadableGenerator.protocolDescription = description;
    
    let output = '';
    
    if (inputs) {
        output += "## PROTOCOL INPUTS\n\n";
        output += inputs + "\n";
    }
    
    output += steps;
    
    if (outputs) {
        output += "## PROTOCOL OUTPUTS\n\n";
        output += outputs + "\n";
    }
    
    return output;
};

ReadableGenerator['protocol_sequence'] = function(block) {
    ReadableGenerator.sectionCounter++;
    const name = block.getFieldValue('NAME');
    const description = block.getFieldValue('DESCRIPTION');
    const steps = ReadableGenerator.statementToCode(block, 'STEPS');
    
    let output = `## SEQUENCE ${ReadableGenerator.sectionCounter}: ${name}\n\n`;
    if (description) {
        output += `**Description:** ${description}\n\n`;
    }
    output += steps + "\n";
    
    return output;
};

ReadableGenerator['parallel_steps'] = function(block) {
    const branch1 = ReadableGenerator.statementToCode(block, 'BRANCH1');
    const branch2 = ReadableGenerator.statementToCode(block, 'BRANCH2');
    const branch3 = ReadableGenerator.statementToCode(block, 'BRANCH3');
    
    let output = `### Parallel Execution\n\n`;
    output += `**Branch 1:**\n`;
    output += ReadableGenerator.prefixLines(branch1, "  ");
    output += `\n**Branch 2:**\n`;
    output += ReadableGenerator.prefixLines(branch2, "  ");
    
    if (branch3) {
        output += `\n**Branch 3:**\n`;
        output += ReadableGenerator.prefixLines(branch3, "  ");
    }
    
    output += "\n*Note: Execute all branches simultaneously*\n\n";
    
    return output;
};

// Basic blocks
ReadableGenerator['math_number'] = function(block) {
    const code = String(parseFloat(block.getFieldValue('NUM')));
    return [code, ReadableGenerator.ORDER_ATOMIC];
};

ReadableGenerator['text'] = function(block) {
    const code = block.getFieldValue('TEXT');
    return [code, ReadableGenerator.ORDER_ATOMIC];
};

ReadableGenerator['logic_boolean'] = function(block) {
    const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
    return [code, ReadableGenerator.ORDER_ATOMIC];
};

ReadableGenerator['logic_compare'] = function(block) {
    const OPERATORS = {
        'EQ': '=',
        'NEQ': '≠',
        'LT': '<',
        'LTE': '≤',
        'GT': '>',
        'GTE': '≥'
    };
    const operator = OPERATORS[block.getFieldValue('OP')];
    const order = ReadableGenerator.ORDER_RELATIONAL;
    const argument0 = ReadableGenerator.valueToCode(block, 'A', order) || '0';
    const argument1 = ReadableGenerator.valueToCode(block, 'B', order) || '0';
    const code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
};