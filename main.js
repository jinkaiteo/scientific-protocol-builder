// Initialize Blockly workspace
let workspace;

// Toolbox configuration
const toolbox = {
    "kind": "categoryToolbox",
    "contents": [
        {
            "kind": "category",
            "name": "Variables & Materials",
            "colour": "#5ba55b",
            "contents": [
                {"kind": "block", "type": "sample_variable"},
                {"kind": "block", "type": "reagent_variable"},
                {"kind": "block", "type": "equipment_variable"},
                {"kind": "block", "type": "parameter_variable"},
                {"kind": "block", "type": "get_variable"},
                {"kind": "block", "type": "set_variable"}
            ]
        },
        {
            "kind": "category",
            "name": "Basic Experiment Steps",
            "colour": "#5ba5db",
            "contents": [
                {"kind": "block", "type": "preparation_step"},
                {"kind": "block", "type": "mixing_step"},
                {"kind": "block", "type": "incubation_step"},
                {"kind": "block", "type": "measurement_step"},
                {"kind": "block", "type": "transfer_step"},
                {"kind": "block", "type": "centrifuge_step"},
                {"kind": "block", "type": "wash_step"},
                {"kind": "block", "type": "observation_step"}
            ]
        },
        {
            "kind": "category",
            "name": "🔬 Advanced Instrumentation",
            "colour": "#e74c3c",
            "contents": [
                {"kind": "block", "type": "flow_cytometer"},
                {"kind": "block", "type": "mass_spectrometer"},
                {"kind": "block", "type": "nmr_spectrometer"},
                {"kind": "block", "type": "liquid_handler"},
                {"kind": "block", "type": "high_content_imaging"},
                {"kind": "block", "type": "qpcr_system"},
                {"kind": "block", "type": "ngs_sequencer"},
                {"kind": "block", "type": "protein_purification"},
                {"kind": "block", "type": "cell_sorter"},
                {"kind": "block", "type": "automated_western"}
            ]
        },
        {
            "kind": "category",
            "name": "Control Flow",
            "colour": "#5b80a5",
            "contents": [
                {"kind": "block", "type": "controls_if"},
                {"kind": "block", "type": "controls_repeat_ext"},
                {"kind": "block", "type": "controls_whileUntil"},
                {"kind": "block", "type": "controls_for"},
                {"kind": "block", "type": "protocol_sequence"},
                {"kind": "block", "type": "parallel_steps"}
            ]
        },
        {
            "kind": "category",
            "name": "Logic & Math",
            "colour": "#5b67a5",
            "contents": [
                {"kind": "block", "type": "logic_compare"},
                {"kind": "block", "type": "logic_operation"},
                {"kind": "block", "type": "logic_negate"},
                {"kind": "block", "type": "logic_boolean"},
                {"kind": "block", "type": "math_number"},
                {"kind": "block", "type": "math_arithmetic"},
                {"kind": "block", "type": "text"}
            ]
        },
        {
            "kind": "category",
            "name": "Protocol Management",
            "colour": "#a55b80",
            "contents": [
                {"kind": "block", "type": "protocol_definition"},
                {"kind": "block", "type": "protocol_call"},
                {"kind": "block", "type": "protocol_input"},
                {"kind": "block", "type": "protocol_output"}
            ]
        }
    ]
};

// Initialize workspace when page loads
document.addEventListener('DOMContentLoaded', function() {
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        trashcan: true,
        sounds: false
    });
    
    // Add change listener for real-time updates
    workspace.addChangeListener(function(event) {
        if (event.type === Blockly.Events.BLOCK_CHANGE || 
            event.type === Blockly.Events.BLOCK_MOVE ||
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_DELETE) {
            // Auto-analyze on changes (debounced)
            clearTimeout(window.analysisTimeout);
            window.analysisTimeout = setTimeout(analyzeProtocol, 500);
        }
    });
});

// Generate readable format
function generateReadableFormat() {
    try {
        const code = ReadableGenerator.workspaceToCode(workspace);
        displayOutput('Readable Protocol', code);
    } catch (error) {
        displayError('Error generating readable format: ' + error.message);
    }
}

// Generate Python code
function generatePythonCode() {
    try {
        const code = PythonGenerator.workspaceToCode(workspace);
        displayOutput('Python Code', code);
    } catch (error) {
        displayError('Error generating Python code: ' + error.message);
    }
}

// Analyze protocol inputs/outputs
function analyzeProtocol() {
    try {
        const analysis = ProtocolAnalyzer.analyze(workspace);
        displayAnalysis(analysis);
    } catch (error) {
        displayError('Error analyzing protocol: ' + error.message);
    }
}

// Display output in the output panel
function displayOutput(title, content) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `
        <h4>${title}</h4>
        <pre><code>${content}</code></pre>
    `;
}

// Display analysis in the analysis panel
function displayAnalysis(analysis) {
    const analysisDiv = document.getElementById('analysis');
    
    let html = '<h4>Protocol Analysis</h4>';
    
    // Inputs
    html += '<h5>Inputs:</h5>';
    if (analysis.inputs.length > 0) {
        html += '<ul class="variable-list">';
        analysis.inputs.forEach(input => {
            html += `<li><strong>${input.name}</strong> (${input.type}): ${input.description}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>No inputs defined</p>';
    }
    
    // Intermediates
    html += '<h5>Intermediate Variables:</h5>';
    if (analysis.intermediates.length > 0) {
        html += '<ul class="variable-list">';
        analysis.intermediates.forEach(intermediate => {
            html += `<li><strong>${intermediate.name}</strong> (${intermediate.type}): ${intermediate.description}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>No intermediate variables</p>';
    }
    
    // Outputs
    html += '<h5>Outputs:</h5>';
    if (analysis.outputs.length > 0) {
        html += '<ul class="variable-list">';
        analysis.outputs.forEach(output => {
            html += `<li><strong>${output.name}</strong> (${output.type}): ${output.description}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>No outputs defined</p>';
    }
    
    // Steps summary
    html += '<h5>Protocol Steps:</h5>';
    html += `<p>Total steps: ${analysis.stepCount}</p>`;
    if (analysis.controlFlow.length > 0) {
        html += '<p>Control flow structures:</p><ul>';
        analysis.controlFlow.forEach(flow => {
            html += `<li>${flow}</li>`;
        });
        html += '</ul>';
    }
    
    // Warnings
    if (analysis.warnings.length > 0) {
        html += '<h5>Warnings:</h5>';
        html += '<ul>';
        analysis.warnings.forEach(warning => {
            html += `<li class="error">${warning}</li>`;
        });
        html += '</ul>';
    }
    
    analysisDiv.innerHTML = html;
}

// Display error message
function displayError(message) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `<div class="error">${message}</div>`;
}

// Open protocol manager
function openProtocolManager() {
    window.open('protocol_manager_ui.html', '_blank', 'width=1400,height=800');
}

// Save protocol using new storage system
function saveProtocol() {
    if (typeof protocolStorage === 'undefined') {
        // Fallback to old method if storage system not loaded
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToText(xml);
        const protocolName = prompt('Enter protocol name:');
        
        if (protocolName) {
            localStorage.setItem(`protocol_${protocolName}`, xmlText);
            alert(`Protocol "${protocolName}" saved successfully!`);
        }
        return;
    }
    
    const protocolName = prompt('Enter protocol name:');
    if (!protocolName) return;
    
    try {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToText(xml);
        
        // Get protocol analysis
        let analysis = null;
        try {
            analysis = ProtocolAnalyzer.analyze(workspace);
        } catch (error) {
            console.warn('Could not analyze protocol:', error);
        }
        
        const protocolData = {
            xml: xmlText,
            analysis: analysis
        };
        
        const metadata = {
            name: protocolName,
            description: prompt('Enter protocol description (optional):') || '',
            category: 'General',
            tags: [],
            version: '1.0'
        };
        
        const protocolId = protocolStorage.saveProtocol(protocolData, metadata);
        alert(`Protocol "${protocolName}" saved successfully!`);
        
    } catch (error) {
        alert('Error saving protocol: ' + error.message);
    }
}

// Load protocol from local storage
function loadProtocol() {
    const protocolName = prompt('Enter protocol name to load:');
    
    if (protocolName) {
        const xmlText = localStorage.getItem(`protocol_${protocolName}`);
        if (xmlText) {
            const xml = Blockly.Xml.textToDom(xmlText);
            Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
            alert(`Protocol "${protocolName}" loaded successfully!`);
        } else {
            alert(`Protocol "${protocolName}" not found!`);
        }
    }
}

// Clear workspace
function clearWorkspace() {
    if (confirm('Are you sure you want to clear the workspace?')) {
        workspace.clear();
    }
}