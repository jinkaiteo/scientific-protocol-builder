# Scientific Protocol Builder - Usage Guide

## Quick Start

1. **Open the application**: Open `index.html` or `demo.html` in a web browser
2. **Load an example**: Click "Load PCR Protocol" or "Load ELISA Protocol" to see examples
3. **Build your protocol**: Drag blocks from the toolbox to create your experimental workflow
4. **Generate output**: Use the buttons to create readable documentation or Python code
5. **Analyze your protocol**: Click "Analyze Protocol" to see inputs, outputs, and warnings

## Building Your First Protocol

### Step 1: Define Your Protocol
Start with a "Protocol Definition" block from the "Protocol Management" category:
- Set a meaningful name for your protocol
- Add a description explaining what the protocol does

### Step 2: Define Variables and Materials
Use blocks from "Variables & Materials":
- **Sample Variable**: For biological samples (DNA, RNA, cells, etc.)
- **Reagent Variable**: For chemicals and buffers
- **Equipment Variable**: For laboratory instruments
- **Parameter Variable**: For experimental conditions

### Step 3: Add Experimental Steps
Use blocks from "Experiment Steps":
- **Preparation Step**: Initial setup and preparation
- **Mixing Step**: Combine components with specific conditions
- **Incubation Step**: Time and temperature-controlled reactions
- **Transfer Step**: Move liquids between containers
- **Measurement Step**: Take quantitative measurements
- **Wash Step**: Clean samples and remove unwanted substances
- **Observation Step**: Record visual or manual observations

### Step 4: Add Control Flow
Use blocks from "Control Flow" for complex protocols:
- **If blocks**: Conditional execution based on results
- **Repeat blocks**: Loop operations for multiple cycles
- **Protocol Sequence**: Organize related steps
- **Parallel Steps**: Execute multiple operations simultaneously

### Step 5: Define Inputs and Outputs
- Use "Protocol Input" blocks to specify required parameters
- Use "Protocol Output" blocks to define what the protocol produces

## Output Formats

### 1. Readable Format
Creates human-readable documentation with:
- **Materials list**: All samples, reagents, and equipment
- **Step-by-step procedure**: Detailed instructions
- **Safety notes**: Important safety considerations
- **Quality control**: Guidelines for ensuring success

### 2. Python Code
Generates executable Python functions with:
- **Protocol class structure**: Object-oriented design
- **Step execution**: Automated timing and logging
- **Variable management**: Dynamic parameter handling
- **Error handling**: Robust execution framework

### 3. Protocol Analysis
Provides comprehensive analysis including:
- **Inputs**: Required starting materials and parameters
- **Intermediates**: Variables created during the protocol
- **Outputs**: Final results and measurements
- **Warnings**: Potential issues and optimization suggestions

## Best Practices

### Protocol Design
1. **Start simple**: Begin with basic steps and add complexity gradually
2. **Use clear names**: Give descriptive names to variables and steps
3. **Add descriptions**: Document the purpose of each component
4. **Group related steps**: Use protocol sequences for organization
5. **Include controls**: Add quality checks and validation steps

### Variable Management
1. **Define before use**: Create all variables before referencing them
2. **Use appropriate types**: Choose the correct variable type for your data
3. **Include units**: Always specify units for measurements
4. **Set realistic values**: Use appropriate volumes and concentrations

### Documentation
1. **Add comments**: Use description fields to explain complex steps
2. **Include safety notes**: Document any hazardous procedures
3. **Specify equipment**: Note specific models or settings when important
4. **Record observations**: Use observation blocks for qualitative data

## Common Patterns

### PCR Protocol Pattern
```
1. Define DNA template (Sample Variable)
2. Define primers and polymerase (Reagent Variables)
3. Prepare master mix (Preparation Step)
4. Mix components (Mixing Step)
5. Thermal cycling (Repeat block with Incubation Steps)
6. Measure product (Measurement Step)
```

### Cell Culture Pattern
```
1. Define cell line and media (Variables)
2. Prepare culture vessels (Preparation Step)
3. Thaw and seed cells (Transfer + Incubation)
4. Growth monitoring (Repeat with Observation)
5. Passage when ready (Conditional + Transfer)
```

### Assay Protocol Pattern
```
1. Define samples and reagents (Variables)
2. Prepare assay plates (Preparation Step)
3. Add samples (Transfer Step)
4. Incubation (Incubation Step)
5. Washing (Wash Step)
6. Detection (Measurement Step)
```

## Advanced Features

### Protocol Linking
- Create reusable sub-protocols with "Protocol Definition"
- Call protocols using "Protocol Call" blocks
- Pass parameters between linked protocols
- Build complex workflows from simple components

### Quality Control
- Use conditional blocks to check intermediate results
- Set tolerance limits for measurements
- Add manual checkpoints for critical steps
- Include controls and standards in your protocols

### Parallel Processing
- Use "Parallel Steps" for simultaneous operations
- Optimize protocol timing and efficiency
- Handle multiple samples concurrently
- Coordinate dependent and independent operations

## Troubleshooting

### Common Issues

**Variables not found**
- Ensure variables are defined before use
- Check spelling of variable names
- Verify variable scope in complex protocols

**Missing outputs**
- Add "Protocol Output" blocks to define results
- Connect measurement results to output variables
- Include all important protocol products

**Analysis warnings**
- Review unused variables and remove if unnecessary
- Add missing input parameters
- Define default values for optional inputs

**Code generation errors**
- Check for incomplete block connections
- Verify all required fields are filled
- Ensure proper nesting of control structures

### Getting Help
1. Check the browser console for error messages
2. Use the protocol analyzer to identify issues
3. Start with simple examples and build complexity gradually
4. Review the demo protocols for proper structure

## Extending the System

### Adding New Block Types
1. Define block structure in `blocks/` directory
2. Add code generation in `generators/` directory
3. Update the toolbox in `main.js`
4. Test with the analyzer

### Customizing Output
1. Modify generators for different output formats
2. Add new analysis features to `protocol_analyzer.js`
3. Customize the user interface in `index.html`
4. Add domain-specific block libraries

### Integration
1. Connect to laboratory databases
2. Interface with robotic systems
3. Add version control for protocols
4. Implement collaboration features