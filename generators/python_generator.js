// Python code generator for scientific protocols

const PythonGenerator = new Blockly.Generator('Python');

// Define order of operations
PythonGenerator.ORDER_ATOMIC = 0;
PythonGenerator.ORDER_COLLECTION = 1;
PythonGenerator.ORDER_STRING_CONVERSION = 1;
PythonGenerator.ORDER_MEMBER = 2.1;
PythonGenerator.ORDER_FUNCTION_CALL = 2.2;
PythonGenerator.ORDER_EXPONENTIATION = 3;
PythonGenerator.ORDER_UNARY_SIGN = 4;
PythonGenerator.ORDER_MULTIPLICATIVE = 5;
PythonGenerator.ORDER_ADDITIVE = 6;
PythonGenerator.ORDER_BITWISE_SHIFT = 7;
PythonGenerator.ORDER_BITWISE_AND = 8;
PythonGenerator.ORDER_BITWISE_XOR = 9;
PythonGenerator.ORDER_BITWISE_OR = 10;
PythonGenerator.ORDER_RELATIONAL = 11;
PythonGenerator.ORDER_LOGICAL_AND = 12;
PythonGenerator.ORDER_LOGICAL_OR = 13;
PythonGenerator.ORDER_CONDITIONAL = 14;
PythonGenerator.ORDER_LAMBDA = 15;
PythonGenerator.ORDER_NONE = 99;

// Initialize with imports and helper functions
PythonGenerator.init = function(workspace) {
    PythonGenerator.definitions_ = {};
    PythonGenerator.functionNames_ = {};
    
    // Add required imports
    PythonGenerator.definitions_['import_time'] = 'import time';
    PythonGenerator.definitions_['import_datetime'] = 'from datetime import datetime';
    PythonGenerator.definitions_['import_typing'] = 'from typing import Dict, List, Any, Optional';
    
    // Add protocol base class
    PythonGenerator.definitions_['protocol_base'] = `
class ProtocolStep:
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.timestamp = None
        self.duration = None
        self.results = {}
        
    def execute(self, **kwargs):
        start_time = time.time()
        self.timestamp = datetime.now()
        print(f"Executing: {self.name}")
        if self.description:
            print(f"  Description: {self.description}")
        
        # Implement step logic here
        result = self._execute_step(**kwargs)
        
        self.duration = time.time() - start_time
        print(f"  Completed in {self.duration:.2f} seconds")
        return result
        
    def _execute_step(self, **kwargs):
        pass

class Protocol:
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.steps = []
        self.variables = {}
        self.inputs = {}
        self.outputs = {}
        
    def add_step(self, step: ProtocolStep):
        self.steps.append(step)
        
    def set_variable(self, name: str, value: Any):
        self.variables[name] = value
        
    def get_variable(self, name: str, default=None):
        return self.variables.get(name, default)
        
    def execute(self, **inputs):
        print(f"\\nStarting protocol: {self.name}")
        print(f"Description: {self.description}")
        print("-" * 50)
        
        # Set input variables
        for name, value in inputs.items():
            self.set_variable(name, value)
            
        # Execute steps
        for i, step in enumerate(self.steps, 1):
            print(f"\\nStep {i}/{len(self.steps)}:")
            step.execute(**self.variables)
            
        print("\\nProtocol completed successfully!")
        return self.outputs
`;
};

// Finish code generation
PythonGenerator.finish = function(code) {
    // Convert the definitions dictionary into a list
    const definitions = [];
    for (let name in PythonGenerator.definitions_) {
        definitions.push(PythonGenerator.definitions_[name]);
    }
    
    // Add main execution
    const mainCode = `
# Generated protocol execution
if __name__ == "__main__":
    protocol = create_protocol()
    
    # Example execution with sample inputs
    # Modify these inputs as needed
    results = protocol.execute(
        # Add your input parameters here
    )
    
    print("\\nProtocol results:")
    for key, value in results.items():
        print(f"  {key}: {value}")
`;
    
    return definitions.join('\n') + '\n\n' + code + mainCode;
};

// Variable blocks
PythonGenerator['sample_variable'] = function(block) {
    const name = block.getFieldValue('NAME');
    const volume = PythonGenerator.valueToCode(block, 'VOLUME', PythonGenerator.ORDER_NONE) || '0';
    const concentration = PythonGenerator.valueToCode(block, 'CONCENTRATION', PythonGenerator.ORDER_NONE) || '0';
    const type = block.getFieldValue('TYPE');
    const description = block.getFieldValue('DESCRIPTION');
    
    const code = `protocol.set_variable('${name}', {
    'type': 'sample',
    'sample_type': '${type}',
    'volume': ${volume},
    'concentration': ${concentration},
    'description': '${description}'
})\n`;
    
    return code;
};

PythonGenerator['reagent_variable'] = function(block) {
    const name = block.getFieldValue('NAME');
    const concentration = PythonGenerator.valueToCode(block, 'CONCENTRATION', PythonGenerator.ORDER_NONE) || '0';
    const units = block.getFieldValue('UNITS');
    const volume = PythonGenerator.valueToCode(block, 'VOLUME', PythonGenerator.ORDER_NONE) || '0';
    const storage = block.getFieldValue('STORAGE');
    const description = block.getFieldValue('DESCRIPTION');
    
    const code = `protocol.set_variable('${name}', {
    'type': 'reagent',
    'concentration': ${concentration},
    'units': '${units}',
    'volume': ${volume},
    'storage': '${storage}',
    'description': '${description}'
})\n`;
    
    return code;
};

PythonGenerator['get_variable'] = function(block) {
    const varName = block.getFieldValue('VAR_NAME');
    const code = `protocol.get_variable('${varName}')`;
    return [code, PythonGenerator.ORDER_FUNCTION_CALL];
};

PythonGenerator['set_variable'] = function(block) {
    const varName = block.getFieldValue('VAR_NAME');
    const value = PythonGenerator.valueToCode(block, 'VALUE', PythonGenerator.ORDER_NONE) || 'None';
    const code = `protocol.set_variable('${varName}', ${value})\n`;
    return code;
};

// Experiment step blocks
PythonGenerator['preparation_step'] = function(block) {
    const what = block.getFieldValue('WHAT');
    const method = block.getFieldValue('METHOD');
    const materials = PythonGenerator.valueToCode(block, 'MATERIALS', PythonGenerator.ORDER_NONE) || 'None';
    const conditions = PythonGenerator.valueToCode(block, 'CONDITIONS', PythonGenerator.ORDER_NONE) || 'None';
    const substeps = PythonGenerator.statementToCode(block, 'SUBSTEPS');
    
    const code = `
class PreparationStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  Preparing: ${what}")
        print(f"  Method: ${method}")
        print(f"  Materials: {${materials}}")
        print(f"  Conditions: {${conditions}}")
        ${substeps ? 'print("  Executing substeps:")' : ''}
        ${PythonGenerator.prefixLines(substeps, '        ')}
        return {"prepared_sample": "${what}"}

protocol.add_step(PreparationStep("Prepare ${what}", "Prepare ${what} using ${method}"))
`;
    
    return code;
};

PythonGenerator['mixing_step'] = function(block) {
    const components = block.getFieldValue('COMPONENTS');
    const volume = PythonGenerator.valueToCode(block, 'VOLUME', PythonGenerator.ORDER_NONE) || '0';
    const speed = PythonGenerator.valueToCode(block, 'SPEED', PythonGenerator.ORDER_NONE) || '0';
    const time = PythonGenerator.valueToCode(block, 'TIME', PythonGenerator.ORDER_NONE) || '0';
    const method = block.getFieldValue('METHOD');
    
    const code = `
class MixingStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  Mixing: ${components}")
        print(f"  Volume: {${volume}} μL")
        print(f"  Speed: {${speed}} rpm")
        print(f"  Time: {${time}} min")
        print(f"  Method: ${method}")
        time.sleep(${time} * 60)  # Convert minutes to seconds
        return {"mixed_sample": "${components}"}

protocol.add_step(MixingStep("Mix ${components}", "Mix ${components} using ${method}"))
`;
    
    return code;
};

PythonGenerator['measurement_step'] = function(block) {
    const measurementType = block.getFieldValue('MEASUREMENT_TYPE');
    const sample = PythonGenerator.valueToCode(block, 'SAMPLE', PythonGenerator.ORDER_NONE) || 'None';
    const wavelength = PythonGenerator.valueToCode(block, 'WAVELENGTH', PythonGenerator.ORDER_NONE) || '0';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    const code = `
class MeasurementStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  Measuring: ${measurementType}")
        print(f"  Sample: {${sample}}")
        print(f"  Wavelength: {${wavelength}} nm")
        # Simulate measurement (replace with actual measurement code)
        import random
        measurement_value = random.uniform(0.1, 2.0)
        protocol.set_variable('${resultVar}', measurement_value)
        print(f"  Result: {measurement_value}")
        return {"${resultVar}": measurement_value}

protocol.add_step(MeasurementStep("Measure ${measurementType}", "Measure ${measurementType} of sample"))
`;
    
    return code;
};

// Control flow blocks
PythonGenerator['controls_if'] = function(block) {
    let n = 0;
    let code = '';
    let branchCode, conditionCode;
    
    if (PythonGenerator.STATEMENT_PREFIX) {
        code += PythonGenerator.injectId(PythonGenerator.STATEMENT_PREFIX, block);
    }
    
    do {
        conditionCode = PythonGenerator.valueToCode(block, 'IF' + n, PythonGenerator.ORDER_NONE) || 'False';
        branchCode = PythonGenerator.statementToCode(block, 'DO' + n);
        if (PythonGenerator.STATEMENT_SUFFIX) {
            branchCode = PythonGenerator.prefixLines(
                PythonGenerator.injectId(PythonGenerator.STATEMENT_SUFFIX, block),
                PythonGenerator.INDENT) + branchCode;
        }
        code += (n > 0 ? 'el' : '') + 'if ' + conditionCode + ':\n' + branchCode;
        ++n;
    } while (block.getInput('IF' + n));
    
    if (block.getInput('ELSE')) {
        branchCode = PythonGenerator.statementToCode(block, 'ELSE');
        if (PythonGenerator.STATEMENT_SUFFIX) {
            branchCode = PythonGenerator.prefixLines(
                PythonGenerator.injectId(PythonGenerator.STATEMENT_SUFFIX, block),
                PythonGenerator.INDENT) + branchCode;
        }
        code += 'else:\n' + branchCode;
    }
    
    return code;
};

PythonGenerator['protocol_definition'] = function(block) {
    const protocolName = block.getFieldValue('PROTOCOL_NAME');
    const description = block.getFieldValue('DESCRIPTION');
    const inputs = PythonGenerator.statementToCode(block, 'INPUTS');
    const steps = PythonGenerator.statementToCode(block, 'STEPS');
    const outputs = PythonGenerator.statementToCode(block, 'OUTPUTS');
    
    const code = `
def create_protocol():
    protocol = Protocol("${protocolName}", "${description}")
    
    # Define inputs
${PythonGenerator.prefixLines(inputs, '    ')}
    
    # Define protocol steps
${PythonGenerator.prefixLines(steps, '    ')}
    
    # Define outputs
${PythonGenerator.prefixLines(outputs, '    ')}
    
    return protocol
`;
    
    return code;
};

// Basic blocks (numbers, text, etc.)
PythonGenerator['math_number'] = function(block) {
    const code = String(parseFloat(block.getFieldValue('NUM')));
    return [code, PythonGenerator.ORDER_ATOMIC];
};

PythonGenerator['text'] = function(block) {
    const code = PythonGenerator.quote_(block.getFieldValue('TEXT'));
    return [code, PythonGenerator.ORDER_ATOMIC];
};

PythonGenerator['logic_boolean'] = function(block) {
    const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';
    return [code, PythonGenerator.ORDER_ATOMIC];
};