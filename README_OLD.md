# Scientific Protocol Builder

A Google Blockly-based visual programming environment for designing and documenting scientific experiment protocols.

## Features

### Visual Protocol Design
- **Drag-and-drop interface** for building experimental workflows
- **Scientific experiment blocks** including:
  - Sample preparation
  - Mixing and reagent handling
  - Incubation and temperature control
  - Measurements and observations
  - Centrifugation and washing
  - Transfer operations

### Variable Management
- **Sample variables** with type, volume, and concentration tracking
- **Reagent variables** with concentration, storage, and safety information
- **Equipment variables** with model and settings
- **Parameter variables** for experimental conditions

### Control Flow
- **Conditional execution** (if-then-else logic)
- **Loops** (repeat, while, for)
- **Parallel execution** of multiple experimental branches
- **Protocol sequences** for organizing complex workflows
- **Quality control checkpoints**

### Protocol Management
- **Reusable protocol definitions** with inputs and outputs
- **Protocol calling** to link protocols together
- **Save/load functionality** for protocol persistence
- **Input/output analysis** for protocol validation

## Output Formats

### 1. Readable Protocol Format
Generates human-readable documentation including:
- Materials and reagents list
- Step-by-step procedures
- Safety notes and quality control guidelines
- Markdown-formatted output for easy sharing

### 2. Executable Python Code
Generates Python functions with:
- Structured protocol classes
- Step execution with timing and logging
- Variable management and tracking
- Input validation and error handling

### 3. Protocol Analysis
Provides comprehensive analysis of:
- **Inputs**: Required parameters and materials
- **Intermediates**: Variables created and used within the protocol
- **Outputs**: Results and measurements produced
- **Warnings**: Potential issues and optimization suggestions

## Getting Started

1. **Open `index.html`** in a web browser
2. **Drag blocks** from the toolbox to build your protocol
3. **Connect blocks** to create workflow sequences
4. **Define variables** for samples, reagents, and equipment
5. **Generate output** in your preferred format

## Block Categories

### Variables & Materials
- Sample Variable: Define biological samples with type and concentration
- Reagent Variable: Chemical reagents with safety and storage info
- Equipment Variable: Laboratory equipment with settings
- Parameter Variable: Experimental parameters and conditions

### Experiment Steps
- Preparation Step: Sample and material preparation
- Mixing Step: Component mixing with speed and time control
- Incubation Step: Temperature and time-controlled incubation
- Measurement Step: Quantitative measurements (absorbance, fluorescence, etc.)
- Transfer Step: Liquid handling and transfers
- Centrifuge Step: Centrifugation with speed and temperature
- Wash Step: Sample washing and buffer exchanges
- Observation Step: Visual observations and manual checks

### Control Flow
- Conditional blocks for decision-making
- Loop blocks for repetitive operations
- Parallel execution for simultaneous steps
- Protocol sequences for organization

### Protocol Management
- Protocol definition with inputs/outputs
- Protocol calling for modular design
- Input/output parameter management

## Example Use Cases

### PCR Protocol
```
1. Define DNA sample and primers (variables)
2. Prepare PCR mix (mixing step)
3. Add template DNA (transfer step)
4. Run thermocycler program (loop with temperature steps)
5. Analyze results (measurement step)
```

### Cell Culture Protocol
```
1. Define cell line and media (variables)
2. Prepare culture dishes (preparation step)
3. Thaw and seed cells (transfer + incubation)
4. Monitor growth (observation in loop)
5. Passage when confluent (conditional execution)
```

### ELISA Assay
```
1. Prepare samples and standards (variables)
2. Coat plates with antigen (transfer + incubation)
3. Wash and block (wash + incubation)
4. Add samples (transfer + incubation)
5. Detect and measure (measurement step)
```

## Advanced Features

### Quality Control
- Built-in validation checks
- Manual confirmation checkpoints
- Tolerance-based quality assessment
- Protocol deviation tracking

### Protocol Linking
- Chain multiple protocols together
- Pass outputs from one protocol as inputs to another
- Build complex experimental workflows
- Reuse validated sub-protocols

### Real-time Analysis
- Live input/output analysis as you build
- Automatic detection of unused variables
- Warning system for common issues
- Protocol optimization suggestions

## Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, JavaScript
- **Block Engine**: Google Blockly framework
- **Code Generation**: Custom generators for Python and readable formats
- **Analysis Engine**: Static analysis of protocol structure

### Browser Compatibility
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### Storage
- Local storage for protocol persistence
- JSON-based protocol serialization
- Import/export capability

## Contributing

This is a modular system designed for extension:

1. **Add new block types** in the `blocks/` directory
2. **Extend generators** in the `generators/` directory
3. **Enhance analysis** in `protocol_analyzer.js`
4. **Improve UI** in the main HTML/CSS files

## License

This project builds upon Google Blockly (Apache 2.0 license) and is released under the same license.

## Future Enhancements

- **Database integration** for reagent and equipment databases
- **Robot integration** for automated protocol execution
- **Version control** for protocol development
- **Collaboration features** for team protocol development
- **Protocol validation** against safety databases
- **Cost estimation** for protocol optimization
- **Timeline visualization** for protocol planning