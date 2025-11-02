// Readable format generators for specialized equipment blocks

// Flow Cytometer readable generator
ReadableGenerator['flow_cytometer'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'sample';
    const laser = block.getFieldValue('LASER');
    const detector = block.getFieldValue('DETECTOR');
    const flowRate = ReadableGenerator.valueToCode(block, 'FLOW_RATE', ReadableGenerator.ORDER_NONE) || 'standard flow rate';
    const eventCount = ReadableGenerator.valueToCode(block, 'EVENT_COUNT', ReadableGenerator.ORDER_NONE) || '10,000';
    const gating = block.getFieldValue('GATING');
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Flow Cytometry Analysis\n\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**Laser wavelength:** ${laser} nm\n`;
    output += `**Detector:** ${detector}\n`;
    output += `**Flow rate:** ${flowRate} μL/min\n`;
    output += `**Events to collect:** ${eventCount}\n`;
    output += `**Gating strategy:** ${gating}\n`;
    output += `**Store results as:** ${resultVar}\n\n`;
    output += `**Procedure:**\n`;
    output += `1. Prepare flow cytometer with ${laser}nm laser\n`;
    output += `2. Set flow rate to ${flowRate} μL/min\n`;
    output += `3. Configure ${detector} detector for analysis\n`;
    output += `4. Apply gating strategy: ${gating}\n`;
    output += `5. Acquire ${eventCount} events\n`;
    output += `6. Save data and analyze results\n\n`;
    
    return output;
};

// Mass Spectrometer readable generator
ReadableGenerator['mass_spectrometer'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'sample';
    const ionization = block.getFieldValue('IONIZATION');
    const analyzer = block.getFieldValue('ANALYZER');
    const mode = block.getFieldValue('MODE');
    const massRangeLow = ReadableGenerator.valueToCode(block, 'MASS_RANGE_LOW', ReadableGenerator.ORDER_NONE) || '50';
    const massRangeHigh = ReadableGenerator.valueToCode(block, 'MASS_RANGE_HIGH', ReadableGenerator.ORDER_NONE) || '2000';
    const resolution = ReadableGenerator.valueToCode(block, 'RESOLUTION', ReadableGenerator.ORDER_NONE) || 'high resolution';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Mass Spectrometry Analysis\n\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**Ionization method:** ${ionization}\n`;
    output += `**Mass analyzer:** ${analyzer}\n`;
    output += `**Detection mode:** ${mode}\n`;
    output += `**Mass range:** ${massRangeLow} - ${massRangeHigh} Da\n`;
    output += `**Resolution:** ${resolution}\n`;
    output += `**Store spectrum as:** ${resultVar}\n\n`;
    output += `**Procedure:**\n`;
    output += `1. Prepare sample for ${ionization} ionization\n`;
    output += `2. Set up ${analyzer} analyzer in ${mode} mode\n`;
    output += `3. Configure mass range: ${massRangeLow}-${massRangeHigh} Da\n`;
    output += `4. Set resolution to ${resolution}\n`;
    output += `5. Acquire mass spectrum\n`;
    output += `6. Process and analyze spectral data\n\n`;
    
    return output;
};

// NMR Spectrometer readable generator
ReadableGenerator['nmr_spectrometer'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'sample';
    const nucleus = block.getFieldValue('NUCLEUS');
    const frequency = ReadableGenerator.valueToCode(block, 'FREQUENCY', ReadableGenerator.ORDER_NONE) || '400';
    const experiment = block.getFieldValue('EXPERIMENT');
    const pulseSequence = ReadableGenerator.valueToCode(block, 'PULSE_SEQUENCE', ReadableGenerator.ORDER_NONE) || 'standard';
    const acquisitionTime = ReadableGenerator.valueToCode(block, 'ACQUISITION_TIME', ReadableGenerator.ORDER_NONE) || '30';
    const solvent = block.getFieldValue('SOLVENT');
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: NMR Spectroscopy\n\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**Nucleus:** ${nucleus}\n`;
    output += `**Spectrometer frequency:** ${frequency} MHz\n`;
    output += `**Experiment type:** ${experiment}\n`;
    output += `**Pulse sequence:** ${pulseSequence}\n`;
    output += `**Acquisition time:** ${acquisitionTime} minutes\n`;
    output += `**Solvent:** ${solvent}\n`;
    output += `**Store spectrum as:** ${resultVar}\n\n`;
    output += `**Procedure:**\n`;
    output += `1. Dissolve sample in ${solvent}\n`;
    output += `2. Transfer to NMR tube and insert into ${frequency} MHz spectrometer\n`;
    output += `3. Shim and tune spectrometer\n`;
    output += `4. Set up ${experiment} experiment with ${pulseSequence} pulse sequence\n`;
    output += `5. Acquire spectrum for ${acquisitionTime} minutes\n`;
    output += `6. Process and analyze NMR data\n\n`;
    
    return output;
};

// Automated Liquid Handler readable generator
ReadableGenerator['liquid_handler'] = function(block) {
    ReadableGenerator.stepCounter++;
    const system = block.getFieldValue('SYSTEM');
    const sourcePlate = ReadableGenerator.valueToCode(block, 'SOURCE_PLATE', ReadableGenerator.ORDER_NONE) || 'source plate';
    const destPlate = ReadableGenerator.valueToCode(block, 'DEST_PLATE', ReadableGenerator.ORDER_NONE) || 'destination plate';
    const tipType = block.getFieldValue('TIP_TYPE');
    const volumeMap = ReadableGenerator.valueToCode(block, 'VOLUME_MAP', ReadableGenerator.ORDER_NONE) || 'volume mapping';
    const mixEnable = block.getFieldValue('MIX_ENABLE') === 'TRUE';
    const mixCycles = block.getFieldValue('MIX_CYCLES');
    const aspSpeed = block.getFieldValue('ASP_SPEED');
    const qcEnable = block.getFieldValue('QC_ENABLE') === 'TRUE';
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Automated Liquid Handling\n\n`;
    output += `**System:** ${system}\n`;
    output += `**Source plate:** ${sourcePlate}\n`;
    output += `**Destination plate:** ${destPlate}\n`;
    output += `**Tip type:** ${tipType}\n`;
    output += `**Volume mapping:** ${volumeMap}\n`;
    output += `**Aspiration speed:** ${aspSpeed}\n`;
    if (mixEnable) {
        output += `**Mixing:** Enabled (${mixCycles} cycles)\n`;
    }
    if (qcEnable) {
        output += `**Quality control:** Enabled\n`;
    }
    output += `\n**Procedure:**\n`;
    output += `1. Initialize ${system} liquid handling system\n`;
    output += `2. Load ${tipType} tips\n`;
    output += `3. Position source plate (${sourcePlate}) and destination plate (${destPlate})\n`;
    output += `4. Execute liquid transfers according to ${volumeMap}\n`;
    output += `5. Set aspiration speed to ${aspSpeed}\n`;
    if (mixEnable) {
        output += `6. Perform mixing with ${mixCycles} cycles after each transfer\n`;
    }
    if (qcEnable) {
        output += `7. Perform quality control checks\n`;
    }
    output += `8. Dispose of tips and complete protocol\n\n`;
    
    return output;
};

// High-Content Imaging readable generator
ReadableGenerator['high_content_imaging'] = function(block) {
    ReadableGenerator.stepCounter++;
    const samplePlate = ReadableGenerator.valueToCode(block, 'SAMPLE_PLATE', ReadableGenerator.ORDER_NONE) || 'sample plate';
    const microscope = block.getFieldValue('MICROSCOPE');
    const objective = block.getFieldValue('OBJECTIVE');
    const dapi = block.getFieldValue('DAPI') === 'TRUE';
    const fitc = block.getFieldValue('FITC') === 'TRUE';
    const tritc = block.getFieldValue('TRITC') === 'TRUE';
    const cy5 = block.getFieldValue('CY5') === 'TRUE';
    const fieldsPerWell = ReadableGenerator.valueToCode(block, 'FIELDS_PER_WELL', ReadableGenerator.ORDER_NONE) || '4';
    const zPlanes = ReadableGenerator.valueToCode(block, 'Z_PLANES', ReadableGenerator.ORDER_NONE) || '1';
    const analysis = block.getFieldValue('ANALYSIS');
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    const channels = [];
    if (dapi) channels.push('DAPI');
    if (fitc) channels.push('FITC');
    if (tritc) channels.push('TRITC');
    if (cy5) channels.push('Cy5');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: High-Content Imaging\n\n`;
    output += `**Sample plate:** ${samplePlate}\n`;
    output += `**Microscope:** ${microscope}\n`;
    output += `**Objective:** ${objective}\n`;
    output += `**Fluorescence channels:** ${channels.join(', ')}\n`;
    output += `**Fields per well:** ${fieldsPerWell}\n`;
    output += `**Z-planes:** ${zPlanes}\n`;
    output += `**Analysis type:** ${analysis}\n`;
    output += `**Store results as:** ${resultVar}\n\n`;
    output += `**Procedure:**\n`;
    output += `1. Load ${samplePlate} into ${microscope}\n`;
    output += `2. Configure ${objective} objective\n`;
    output += `3. Set up fluorescence channels: ${channels.join(', ')}\n`;
    output += `4. Program acquisition: ${fieldsPerWell} fields per well, ${zPlanes} Z-planes\n`;
    output += `5. Execute automated imaging acquisition\n`;
    output += `6. Perform ${analysis} analysis\n`;
    output += `7. Export and save imaging data\n\n`;
    
    return output;
};

// Real-Time PCR readable generator
ReadableGenerator['qpcr_system'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'sample';
    const system = block.getFieldValue('SYSTEM');
    const volume = block.getFieldValue('VOLUME');
    const chemistry = block.getFieldValue('CHEMISTRY');
    const initialDenatureTemp = ReadableGenerator.valueToCode(block, 'INITIAL_DENATURATION_TEMP', ReadableGenerator.ORDER_NONE) || '95';
    const initialDenatureTime = ReadableGenerator.valueToCode(block, 'INITIAL_DENATURATION_TIME', ReadableGenerator.ORDER_NONE) || '10';
    const cycles = ReadableGenerator.valueToCode(block, 'CYCLES', ReadableGenerator.ORDER_NONE) || '40';
    const denatureTemp = ReadableGenerator.valueToCode(block, 'DENATURATION_TEMP', ReadableGenerator.ORDER_NONE) || '95';
    const annealingTemp = ReadableGenerator.valueToCode(block, 'ANNEALING_TEMP', ReadableGenerator.ORDER_NONE) || '60';
    const extensionTemp = ReadableGenerator.valueToCode(block, 'EXTENSION_TEMP', ReadableGenerator.ORDER_NONE) || '72';
    const meltCurve = block.getFieldValue('MELT_CURVE') === 'TRUE';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Real-Time PCR (qPCR)\n\n`;
    output += `**Sample:** ${sample}\n`;
    output += `**qPCR system:** ${system}\n`;
    output += `**Reaction volume:** ${volume} μL\n`;
    output += `**Detection chemistry:** ${chemistry}\n`;
    output += `**Store results as:** ${resultVar}\n\n`;
    output += `**Thermal cycling program:**\n`;
    output += `1. **Initial denaturation:** ${initialDenatureTemp}°C for ${initialDenatureTime} minutes\n`;
    output += `2. **PCR cycles:** Repeat ${cycles} times:\n`;
    output += `   - Denaturation: ${denatureTemp}°C for 15 seconds\n`;
    output += `   - Annealing: ${annealingTemp}°C for 30 seconds\n`;
    output += `   - Extension: ${extensionTemp}°C for 30 seconds\n`;
    if (meltCurve) {
        output += `3. **Melt curve analysis:** 60°C to 95°C, increment 0.5°C\n`;
    }
    output += `\n**Procedure:**\n`;
    output += `1. Prepare qPCR reactions with ${chemistry} chemistry\n`;
    output += `2. Load samples into ${system}\n`;
    output += `3. Execute thermal cycling program\n`;
    output += `4. Monitor fluorescence in real-time\n`;
    if (meltCurve) {
        output += `5. Perform melt curve analysis\n`;
    }
    output += `6. Analyze CT values and amplification curves\n\n`;
    
    return output;
};

// Next-Generation Sequencing readable generator
ReadableGenerator['ngs_sequencer'] = function(block) {
    ReadableGenerator.stepCounter++;
    const library = ReadableGenerator.valueToCode(block, 'LIBRARY', ReadableGenerator.ORDER_NONE) || 'DNA library';
    const platform = block.getFieldValue('PLATFORM');
    const readType = block.getFieldValue('READ_TYPE');
    const readLength = ReadableGenerator.valueToCode(block, 'READ_LENGTH', ReadableGenerator.ORDER_NONE) || '150';
    const kit = block.getFieldValue('KIT');
    const clusterDensity = ReadableGenerator.valueToCode(block, 'CLUSTER_DENSITY', ReadableGenerator.ORDER_NONE) || '200';
    const coverage = ReadableGenerator.valueToCode(block, 'COVERAGE', ReadableGenerator.ORDER_NONE) || '30';
    const qcEnable = block.getFieldValue('QC_ENABLE') === 'TRUE';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Next-Generation Sequencing\n\n`;
    output += `**DNA library:** ${library}\n`;
    output += `**Sequencing platform:** ${platform}\n`;
    output += `**Read configuration:** ${readType}, ${readLength} bp\n`;
    output += `**Sequencing kit:** ${kit}\n`;
    output += `**Target cluster density:** ${clusterDensity} K/mm²\n`;
    output += `**Target coverage:** ${coverage}X\n`;
    if (qcEnable) {
        output += `**Quality control:** Enabled\n`;
    }
    output += `**Store data as:** ${resultVar}\n\n`;
    output += `**Procedure:**\n`;
    output += `1. **Library preparation validation:**\n`;
    output += `   - Verify library concentration and size distribution\n`;
    output += `   - Dilute library to optimal loading concentration\n`;
    output += `2. **Sequencer setup:**\n`;
    output += `   - Install ${kit} reagents\n`;
    output += `   - Load flow cell\n`;
    output += `   - Prime fluidics system\n`;
    output += `3. **Sample loading:**\n`;
    output += `   - Load ${library} onto flow cell\n`;
    output += `   - Perform cluster generation\n`;
    output += `   - Target cluster density: ${clusterDensity} K/mm²\n`;
    output += `4. **Sequencing run:**\n`;
    output += `   - Execute ${readType} sequencing\n`;
    output += `   - Read length: ${readLength} bp\n`;
    output += `   - Monitor run metrics in real-time\n`;
    if (qcEnable) {
        output += `5. **Quality control:**\n`;
        output += `   - Monitor cluster density and quality scores\n`;
        output += `   - Check error rates and base calling accuracy\n`;
    }
    output += `6. **Data generation:**\n`;
    output += `   - Generate FASTQ files\n`;
    output += `   - Perform initial quality assessment\n`;
    output += `   - Archive raw sequencing data\n\n`;
    
    return output;
};

// Protein Purification readable generator
ReadableGenerator['protein_purification'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'protein sample';
    const system = block.getFieldValue('SYSTEM');
    const method = block.getFieldValue('METHOD');
    const column = ReadableGenerator.valueToCode(block, 'COLUMN', ReadableGenerator.ORDER_NONE) || 'chromatography column';
    const flowRate = ReadableGenerator.valueToCode(block, 'FLOW_RATE', ReadableGenerator.ORDER_NONE) || '1.0';
    const bufferA = ReadableGenerator.valueToCode(block, 'BUFFER_A', ReadableGenerator.ORDER_NONE) || 'buffer A';
    const bufferB = ReadableGenerator.valueToCode(block, 'BUFFER_B', ReadableGenerator.ORDER_NONE) || 'buffer B';
    const gradient = block.getFieldValue('GRADIENT');
    const fractionSize = ReadableGenerator.valueToCode(block, 'FRACTION_SIZE', ReadableGenerator.ORDER_NONE) || '1.0';
    const detection = block.getFieldValue('DETECTION');
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Protein Purification\n\n`;
    output += `**Protein sample:** ${sample}\n`;
    output += `**Purification system:** ${system}\n`;
    output += `**Purification method:** ${method}\n`;
    output += `**Column:** ${column}\n`;
    output += `**Flow rate:** ${flowRate} mL/min\n`;
    output += `**Buffer A:** ${bufferA}\n`;
    output += `**Buffer B:** ${bufferB}\n`;
    output += `**Gradient type:** ${gradient}\n`;
    output += `**Fraction size:** ${fractionSize} mL\n`;
    output += `**Detection method:** ${detection}\n`;
    output += `**Store fractions as:** ${resultVar}\n\n`;
    output += `**Procedure:**\n`;
    output += `1. **System preparation:**\n`;
    output += `   - Install ${column}\n`;
    output += `   - Prime system with ${bufferA}\n`;
    output += `   - Equilibrate column at ${flowRate} mL/min\n`;
    output += `2. **Sample application:**\n`;
    output += `   - Load ${sample} onto column\n`;
    output += `   - Wash with ${bufferA} until stable baseline\n`;
    output += `3. **Protein elution:**\n`;
    output += `   - Apply ${gradient} gradient with ${bufferB}\n`;
    output += `   - Monitor ${detection} signal\n`;
    output += `   - Collect fractions of ${fractionSize} mL\n`;
    output += `4. **Fraction analysis:**\n`;
    output += `   - Analyze peak fractions\n`;
    output += `   - Pool fractions containing target protein\n`;
    output += `   - Store purified protein appropriately\n\n`;
    
    return output;
};

// Cell Sorter readable generator
ReadableGenerator['cell_sorter'] = function(block) {
    ReadableGenerator.stepCounter++;
    const sample = ReadableGenerator.valueToCode(block, 'SAMPLE', ReadableGenerator.ORDER_NONE) || 'cell sample';
    const sorter = block.getFieldValue('SORTER');
    const flowRate = ReadableGenerator.valueToCode(block, 'FLOW_RATE', ReadableGenerator.ORDER_NONE) || '1000';
    const nozzle = block.getFieldValue('NOZZLE');
    const precision = block.getFieldValue('PRECISION');
    const sortGates = ReadableGenerator.statementToCode(block, 'SORT_GATES');
    const collectionTube = ReadableGenerator.valueToCode(block, 'COLLECTION_TUBE', ReadableGenerator.ORDER_NONE) || 'collection tube';
    const postAnalysis = block.getFieldValue('POST_ANALYSIS') === 'TRUE';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Fluorescence-Activated Cell Sorting (FACS)\n\n`;
    output += `**Cell sample:** ${sample}\n`;
    output += `**Cell sorter:** ${sorter}\n`;
    output += `**Flow rate:** ${flowRate} events/sec\n`;
    output += `**Nozzle size:** ${nozzle} μm\n`;
    output += `**Sort precision:** ${precision}\n`;
    output += `**Collection vessel:** ${collectionTube}\n`;
    if (postAnalysis) {
        output += `**Post-sort analysis:** Enabled\n`;
    }
    output += `**Store sorted cells as:** ${resultVar}\n\n`;
    output += `**Sorting gates:**\n`;
    if (sortGates) {
        output += ReadableGenerator.prefixLines(sortGates, "  ");
    } else {
        output += `  - Define sorting gates based on fluorescence parameters\n`;
    }
    output += `\n**Procedure:**\n`;
    output += `1. **Instrument setup:**\n`;
    output += `   - Install ${nozzle} μm nozzle\n`;
    output += `   - Calibrate ${sorter} system\n`;
    output += `   - Set flow rate to ${flowRate} events/sec\n`;
    output += `2. **Sample preparation:**\n`;
    output += `   - Filter ${sample} to remove aggregates\n`;
    output += `   - Adjust cell concentration for optimal sorting\n`;
    output += `3. **Gating and sorting:**\n`;
    output += `   - Set up sorting gates as defined above\n`;
    output += `   - Configure sort precision: ${precision}\n`;
    output += `   - Begin cell sorting into ${collectionTube}\n`;
    output += `4. **Quality control:**\n`;
    output += `   - Monitor sort efficiency and purity\n`;
    output += `   - Collect statistics on sorted populations\n`;
    if (postAnalysis) {
        output += `5. **Post-sort analysis:**\n`;
        output += `   - Re-analyze sorted cells for purity verification\n`;
        output += `   - Document sort efficiency and yield\n`;
    }
    output += `6. **Sample collection:**\n`;
    output += `   - Store sorted cells under appropriate conditions\n`;
    output += `   - Label and document sorted cell populations\n\n`;
    
    return output;
};

// Automated Western Blot readable generator
ReadableGenerator['automated_western'] = function(block) {
    ReadableGenerator.stepCounter++;
    const proteinSample = ReadableGenerator.valueToCode(block, 'PROTEIN_SAMPLE', ReadableGenerator.ORDER_NONE) || 'protein sample';
    const system = block.getFieldValue('SYSTEM');
    const gelType = block.getFieldValue('GEL_TYPE');
    const sampleVolume = ReadableGenerator.valueToCode(block, 'SAMPLE_VOLUME', ReadableGenerator.ORDER_NONE) || '20';
    const primaryAb = ReadableGenerator.valueToCode(block, 'PRIMARY_ANTIBODY', ReadableGenerator.ORDER_NONE) || 'primary antibody';
    const primaryDilution = ReadableGenerator.valueToCode(block, 'PRIMARY_DILUTION', ReadableGenerator.ORDER_NONE) || '1:1000';
    const secondaryAb = ReadableGenerator.valueToCode(block, 'SECONDARY_ANTIBODY', ReadableGenerator.ORDER_NONE) || 'secondary antibody';
    const detection = block.getFieldValue('DETECTION');
    const exposureTime = ReadableGenerator.valueToCode(block, 'EXPOSURE_TIME', ReadableGenerator.ORDER_NONE) || '60';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    let output = `### Step ${ReadableGenerator.stepCounter}: Automated Western Blot\n\n`;
    output += `**Protein sample:** ${proteinSample}\n`;
    output += `**Western blot system:** ${system}\n`;
    output += `**Gel type:** ${gelType}\n`;
    output += `**Sample volume:** ${sampleVolume} μL\n`;
    output += `**Primary antibody:** ${primaryAb} (${primaryDilution})\n`;
    output += `**Secondary antibody:** ${secondaryAb}\n`;
    output += `**Detection method:** ${detection}\n`;
    output += `**Exposure time:** ${exposureTime} seconds\n`;
    output += `**Store results as:** ${resultVar}\n\n`;
    output += `**Procedure:**\n`;
    output += `1. **Sample preparation:**\n`;
    output += `   - Prepare ${proteinSample} in sample buffer\n`;
    output += `   - Denature proteins by heating\n`;
    output += `   - Load ${sampleVolume} μL per lane\n`;
    output += `2. **Electrophoresis:**\n`;
    output += `   - Run ${gelType} gel electrophoresis\n`;
    output += `   - Separate proteins by molecular weight\n`;
    output += `3. **Transfer:**\n`;
    output += `   - Transfer proteins to membrane\n`;
    output += `   - Verify transfer efficiency\n`;
    output += `4. **Blocking and antibody incubation:**\n`;
    output += `   - Block membrane to reduce background\n`;
    output += `   - Incubate with ${primaryAb} at ${primaryDilution}\n`;
    output += `   - Wash and incubate with ${secondaryAb}\n`;
    output += `5. **Detection and imaging:**\n`;
    output += `   - Apply ${detection} detection reagents\n`;
    output += `   - Image with ${system} for ${exposureTime} seconds\n`;
    output += `   - Analyze band intensity and molecular weight\n\n`;
    
    return output;
};