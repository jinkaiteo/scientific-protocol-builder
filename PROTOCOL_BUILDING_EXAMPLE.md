# Step-by-Step Protocol Building Example: DNA Extraction & PCR

## Overview
This guide demonstrates how to build a complete laboratory protocol using the Scientific Protocol Builder. We'll create a DNA extraction and PCR amplification protocol from start to finish.

## Protocol: DNA Extraction followed by PCR Amplification

### Step 1: Open the Protocol Builder
1. Open `demo.html` or `specialized_equipment_demo.html` in your web browser
2. You'll see the visual workspace with blocks in the toolbox on the left

### Step 2: Create Protocol Definition
1. **Drag** a `Protocol Definition` block from **"Protocol Management"** category
2. **Set the fields:**
   - Protocol Name: `DNA_Extraction_PCR`
   - Description: `DNA extraction followed by PCR amplification`

### Step 3: Define Input Variables
**Add Sample Variables:**
1. Drag `Sample Variable` from **"Variables & Materials"**
2. Connect it inside the Protocol Definition's "steps" section
3. Configure:
   - Name: `tissue_sample`
   - Type: `TISSUE`
   - Volume: `100` (add a `Math Number` block)
   - Description: `Fresh tissue sample for DNA extraction`

**Add Reagent Variables:**
1. Add another `Reagent Variable` block
2. Configure:
   - Name: `lysis_buffer`
   - Concentration: `50` (Math Number block)
   - Units: `mM`
   - Volume: `500` μL
   - Storage: `RT`
   - Description: `Cell lysis buffer with protease`

3. Add more reagent blocks for:
   - `wash_buffer` - for DNA washing steps
   - `elution_buffer` - for final DNA elution
   - `pcr_master_mix` - for PCR amplification

### Step 4: Add DNA Extraction Steps

**Sample Preparation:**
1. Add `Preparation Step` from **"Basic Experiment Steps"**
2. Configure:
   - What: `tissue sample`
   - Method: `homogenization`

**Cell Lysis:**
1. Add `Mixing Step`
2. Configure:
   - Components: `tissue with lysis buffer`
   - Volume: `500` μL
   - Method: `VORTEX`
   - Time: `2` minutes

**Incubation:**
1. Add `Incubation Step`
2. Configure:
   - Sample: `lysed sample`
   - Temperature: `56` °C
   - Time: `30` minutes
   - Conditions: `SHAKING`

**Centrifugation:**
1. Add `Centrifuge Step`
2. Configure:
   - Sample: `lysed sample`
   - Speed: `12000` rpm
   - Time: `10` minutes
   - Temperature: `4` °C

**DNA Washing:**
1. Add `Wash Step`
2. Configure:
   - Sample: `DNA pellet`
   - Buffer: `wash buffer`
   - Volume: `500` μL
   - Cycles: `3`
   - Method: `CENTRIFUGATION`

**DNA Elution:**
1. Add `Transfer Step`
2. Configure:
   - Source: `washed DNA pellet`
   - Destination: `elution tube`
   - Volume: `50` μL (elution buffer)
   - Method: `PIPETTE`

### Step 5: Quality Control
**DNA Quantification:**
1. Add `Measurement Step`
2. Configure:
   - Measurement Type: `ABSORBANCE`
   - Sample: `eluted DNA`
   - Wavelength: `260` nm
   - Result Variable: `dna_concentration`

### Step 6: PCR Setup
**PCR Reagents:**
1. Add new `Reagent Variable` blocks for:
   - `forward_primer` (10 μM)
   - `reverse_primer` (10 μM)
   - `taq_polymerase` (5 U/μL)
   - `dntps` (10 mM each)

**Master Mix Preparation:**
1. Add `Preparation Step`
2. Configure:
   - What: `PCR master mix`
   - Method: `pipetting`

### Step 7: PCR Amplification
**qPCR System:**
1. Add `qPCR System` from **"🔬 Advanced Instrumentation"**
2. Configure:
   - Sample: connect to DNA sample
   - System: `CFX96`
   - Volume: `20` μL
   - Chemistry: `SYBR`
   - Initial Denaturation: `95` °C for `10` minutes
   - Cycles: `35`
   - Denaturation: `95` °C
   - Annealing: `60` °C
   - Extension: `72` °C
   - Melt Curve: `TRUE`
   - Result Variable: `qpcr_results`

### Step 8: Results Analysis
**Observation Step:**
1. Add `Observation Step`
2. Configure:
   - Sample: `PCR products`
   - Observe: `amplification curves and Ct values`
   - Record as: `final_results`
   - Time: `5` minutes

**Protocol Output:**
1. Add `Protocol Output` from **"Protocol Management"**
2. Configure:
   - Output Name: `amplified_dna`
   - Type: `sample`
   - Description: `PCR amplified DNA with quantification data`

### Step 9: Generate Protocol Documentation

**Generate Readable Format:**
1. Click **"📄 Generate Readable Protocol"**
2. You'll get a complete step-by-step protocol document like this:

```markdown
# EXPERIMENTAL PROTOCOL

## Protocol: DNA_Extraction_PCR

**Description:** DNA extraction followed by PCR amplification

## MATERIALS AND REAGENTS

### Samples:
- **tissue_sample** (TISSUE): Fresh tissue sample for DNA extraction
  - Volume: 100 μL

### Reagents:
- **lysis_buffer**: 50 mM
  - Cell lysis buffer with protease
  - Storage: RT
- **pcr_master_mix**: PCR reagents
  - Contains Taq polymerase, primers, dNTPs

### Equipment:
- **qPCR System** (CFX96)
  - Real-time PCR with SYBR Green chemistry

## PROCEDURE

### Step 1: Preparation
**Prepare:** tissue sample
**Method:** homogenization

### Step 2: Mixing
**Mix:** tissue with lysis buffer
**Volume:** 500 μL
**Method:** vortex
**Duration:** 2 minutes

### Step 3: Incubation
**Sample:** lysed sample
**Temperature:** 56°C
**Duration:** 30 minutes
**Conditions:** shaking

### Step 4: Centrifugation
**Sample:** lysed sample
**Speed:** 12000 rpm
**Duration:** 10 minutes
**Temperature:** 4°C

### Step 5: Washing
**Sample:** DNA pellet
**Wash buffer:** wash buffer
**Volume per wash:** 500 μL
**Number of cycles:** 3
**Method:** centrifugation

### Step 6: Real-Time PCR (qPCR)
**Sample:** eluted DNA
**qPCR system:** CFX96
**Reaction volume:** 20 μL
**Detection chemistry:** SYBR

**Thermal cycling program:**
1. **Initial denaturation:** 95°C for 10 minutes
2. **PCR cycles:** Repeat 35 times:
   - Denaturation: 95°C for 15 seconds
   - Annealing: 60°C for 30 seconds
   - Extension: 72°C for 30 seconds
3. **Melt curve analysis:** 60°C to 95°C, increment 0.5°C
```

**Generate Python Code:**
1. Click **"🐍 Generate Python Code"**
2. You'll get executable Python code like this:

```python
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

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
        
        result = self._execute_step(**kwargs)
        
        self.duration = time.time() - start_time
        print(f"  Completed in {self.duration:.2f} seconds")
        return result

def create_protocol():
    protocol = Protocol("DNA_Extraction_PCR", "DNA extraction followed by PCR amplification")
    
    # Define variables
    protocol.set_variable('tissue_sample', {
        'type': 'sample',
        'sample_type': 'TISSUE',
        'volume': 100,
        'description': 'Fresh tissue sample for DNA extraction'
    })
    
    # Add protocol steps
    protocol.add_step(PreparationStep("Prepare tissue sample", "Prepare tissue sample using homogenization"))
    protocol.add_step(MixingStep("Mix tissue with lysis buffer", "Mix tissue with lysis buffer using vortex"))
    protocol.add_step(qPCRStep("Real-Time PCR", "qPCR amplification with SYBR chemistry"))
    
    return protocol

if __name__ == "__main__":
    protocol = create_protocol()
    results = protocol.execute()
```

### Step 10: Analyze Your Protocol
1. Click **"📊 Analyze Protocol"**
2. View the analysis showing:
   - **Inputs:** tissue_sample, various reagents
   - **Intermediates:** lysed_sample, DNA_pellet, purified_DNA
   - **Outputs:** amplified_dna, qpcr_results
   - **Warnings:** Any potential issues or suggestions

## Protocol Features Demonstrated

### ✅ **Variables Management**
- Sample variables with types and volumes
- Reagent variables with concentrations and storage
- Parameter tracking throughout the protocol

### ✅ **Experimental Steps**
- Basic lab operations (mixing, centrifugation, washing)
- Advanced instrumentation (qPCR system)
- Quality control measurements

### ✅ **Control Flow**
- Sequential step execution
- Parameter passing between steps
- Result storage and tracking

### ✅ **Documentation Generation**
- Human-readable protocol documents
- Executable Python code
- Complete materials lists and safety notes

### ✅ **Advanced Features**
- Specialized equipment integration
- Real-time data simulation
- Protocol validation and analysis

## Next Steps

After building this protocol, you can:

1. **Save the protocol** for future use
2. **Modify parameters** for different samples or conditions
3. **Add quality control steps** or alternative procedures
4. **Link to other protocols** for complex workflows
5. **Export documentation** for lab notebook or publication

This example demonstrates the power of visual protocol building - converting complex laboratory procedures into standardized, reproducible, and well-documented workflows that can be easily shared and executed.

## Tips for Building Your Own Protocols

1. **Start Simple:** Begin with basic steps and add complexity gradually
2. **Use Clear Names:** Give descriptive names to variables and steps
3. **Add Descriptions:** Document the purpose of each component
4. **Include Controls:** Add quality checks and validation steps
5. **Test Thoroughly:** Generate and review the output before execution

The Scientific Protocol Builder makes laboratory protocol development accessible to researchers without programming experience, while generating professional-quality documentation and executable code for advanced users.