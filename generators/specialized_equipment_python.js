// Python code generators for specialized equipment blocks

// Flow Cytometer generator
PythonGenerator['flow_cytometer'] = function(block) {
    const sample = PythonGenerator.valueToCode(block, 'SAMPLE', PythonGenerator.ORDER_NONE) || 'None';
    const laser = block.getFieldValue('LASER');
    const detector = block.getFieldValue('DETECTOR');
    const flowRate = PythonGenerator.valueToCode(block, 'FLOW_RATE', PythonGenerator.ORDER_NONE) || '100';
    const eventCount = PythonGenerator.valueToCode(block, 'EVENT_COUNT', PythonGenerator.ORDER_NONE) || '10000';
    const gating = block.getFieldValue('GATING');
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    const code = `
class FlowCytometryStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  Flow Cytometry Analysis")
        print(f"  Sample: {${sample}}")
        print(f"  Laser: ${laser}nm")
        print(f"  Detector: ${detector}")
        print(f"  Flow Rate: {${flowRate}} μL/min")
        print(f"  Events to collect: {${eventCount}}")
        print(f"  Gating strategy: ${gating}")
        
        # Simulate flow cytometry data collection
        import random
        import numpy as np
        
        # Generate mock flow cytometry data
        events = int(${eventCount})
        flow_data = {
            'events': events,
            'forward_scatter': np.random.lognormal(3, 0.5, events),
            'side_scatter': np.random.lognormal(2.5, 0.7, events),
            '${detector.toLowerCase()}': np.random.exponential(2, events),
            'gating': '${gating}',
            'laser_wavelength': ${laser},
            'flow_rate': ${flowRate}
        }
        
        protocol.set_variable('${resultVar}', flow_data)
        print(f"  Results stored in: ${resultVar}")
        return {"${resultVar}": flow_data}

protocol.add_step(FlowCytometryStep("Flow Cytometry", "Flow cytometry analysis with ${laser}nm laser"))
`;
    
    return code;
};

// Mass Spectrometer generator
PythonGenerator['mass_spectrometer'] = function(block) {
    const sample = PythonGenerator.valueToCode(block, 'SAMPLE', PythonGenerator.ORDER_NONE) || 'None';
    const ionization = block.getFieldValue('IONIZATION');
    const analyzer = block.getFieldValue('ANALYZER');
    const mode = block.getFieldValue('MODE');
    const massRangeLow = PythonGenerator.valueToCode(block, 'MASS_RANGE_LOW', PythonGenerator.ORDER_NONE) || '50';
    const massRangeHigh = PythonGenerator.valueToCode(block, 'MASS_RANGE_HIGH', PythonGenerator.ORDER_NONE) || '2000';
    const resolution = PythonGenerator.valueToCode(block, 'RESOLUTION', PythonGenerator.ORDER_NONE) || '1000';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    const code = `
class MassSpectrometryStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  Mass Spectrometry Analysis")
        print(f"  Sample: {${sample}}")
        print(f"  Ionization: ${ionization}")
        print(f"  Analyzer: ${analyzer}")
        print(f"  Mode: ${mode}")
        print(f"  Mass range: {${massRangeLow}}-{${massRangeHigh}} Da")
        print(f"  Resolution: {${resolution}}")
        
        # Simulate mass spectrometry data
        import numpy as np
        
        mass_range = np.arange(${massRangeLow}, ${massRangeHigh}, 0.1)
        # Generate mock spectrum with some peaks
        spectrum = np.random.exponential(0.1, len(mass_range))
        
        # Add some characteristic peaks
        peak_masses = [${massRangeLow} + (${massRangeHigh} - ${massRangeLow}) * np.random.random() for _ in range(5)]
        for peak_mass in peak_masses:
            peak_idx = np.argmin(np.abs(mass_range - peak_mass))
            spectrum[peak_idx] += np.random.exponential(10)
        
        ms_data = {
            'mass_range': mass_range,
            'intensity': spectrum,
            'ionization': '${ionization}',
            'analyzer': '${analyzer}',
            'mode': '${mode}',
            'resolution': ${resolution}
        }
        
        protocol.set_variable('${resultVar}', ms_data)
        print(f"  Spectrum acquired and stored in: ${resultVar}")
        return {"${resultVar}": ms_data}

protocol.add_step(MassSpectrometryStep("Mass Spectrometry", "${ionization} ${analyzer} mass spectrometry"))
`;
    
    return code;
};

// NMR Spectrometer generator
PythonGenerator['nmr_spectrometer'] = function(block) {
    const sample = PythonGenerator.valueToCode(block, 'SAMPLE', PythonGenerator.ORDER_NONE) || 'None';
    const nucleus = block.getFieldValue('NUCLEUS');
    const frequency = PythonGenerator.valueToCode(block, 'FREQUENCY', PythonGenerator.ORDER_NONE) || '400';
    const experiment = block.getFieldValue('EXPERIMENT');
    const pulseSequence = PythonGenerator.valueToCode(block, 'PULSE_SEQUENCE', PythonGenerator.ORDER_NONE) || 'standard';
    const acquisitionTime = PythonGenerator.valueToCode(block, 'ACQUISITION_TIME', PythonGenerator.ORDER_NONE) || '30';
    const solvent = block.getFieldValue('SOLVENT');
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    const code = `
class NMRSpectroscopyStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  NMR Spectroscopy")
        print(f"  Sample: {${sample}}")
        print(f"  Nucleus: ${nucleus}")
        print(f"  Frequency: {${frequency}} MHz")
        print(f"  Experiment: ${experiment}")
        print(f"  Pulse sequence: {${pulseSequence}}")
        print(f"  Acquisition time: {${acquisitionTime}} min")
        print(f"  Solvent: ${solvent}")
        
        # Simulate NMR data acquisition
        import numpy as np
        time.sleep(${acquisitionTime} * 60)  # Convert minutes to seconds for simulation
        
        # Generate mock NMR spectrum
        if '${nucleus}' == '1H':
            chemical_shift = np.linspace(0, 12, 2048)  # ppm for 1H
        elif '${nucleus}' == '13C':
            chemical_shift = np.linspace(0, 220, 2048)  # ppm for 13C
        else:
            chemical_shift = np.linspace(-200, 200, 2048)  # general range
            
        # Generate baseline noise
        spectrum = np.random.normal(0, 0.1, len(chemical_shift))
        
        # Add some peaks
        peak_positions = np.random.uniform(min(chemical_shift), max(chemical_shift), 8)
        for pos in peak_positions:
            peak_idx = np.argmin(np.abs(chemical_shift - pos))
            spectrum[peak_idx] += np.random.exponential(5)
        
        nmr_data = {
            'chemical_shift': chemical_shift,
            'intensity': spectrum,
            'nucleus': '${nucleus}',
            'frequency': ${frequency},
            'experiment': '${experiment}',
            'solvent': '${solvent}',
            'acquisition_time': ${acquisitionTime}
        }
        
        protocol.set_variable('${resultVar}', nmr_data)
        print(f"  NMR spectrum acquired and stored in: ${resultVar}")
        return {"${resultVar}": nmr_data}

protocol.add_step(NMRSpectroscopyStep("NMR Spectroscopy", "${nucleus} NMR at ${frequency} MHz"))
`;
    
    return code;
};

// Automated Liquid Handler generator
PythonGenerator['liquid_handler'] = function(block) {
    const system = block.getFieldValue('SYSTEM');
    const sourcePlate = PythonGenerator.valueToCode(block, 'SOURCE_PLATE', PythonGenerator.ORDER_NONE) || 'source_plate';
    const destPlate = PythonGenerator.valueToCode(block, 'DEST_PLATE', PythonGenerator.ORDER_NONE) || 'dest_plate';
    const tipType = block.getFieldValue('TIP_TYPE');
    const volumeMap = PythonGenerator.valueToCode(block, 'VOLUME_MAP', PythonGenerator.ORDER_NONE) || 'volume_map';
    const mixEnable = block.getFieldValue('MIX_ENABLE') === 'TRUE';
    const mixCycles = block.getFieldValue('MIX_CYCLES');
    const aspSpeed = block.getFieldValue('ASP_SPEED');
    const qcEnable = block.getFieldValue('QC_ENABLE') === 'TRUE';
    
    const code = `
class LiquidHandlingStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  Automated Liquid Handling")
        print(f"  System: ${system}")
        print(f"  Source plate: {${sourcePlate}}")
        print(f"  Destination plate: {${destPlate}}")
        print(f"  Tip type: ${tipType}")
        print(f"  Volume mapping: {${volumeMap}}")
        print(f"  Mixing: ${mixEnable ? 'enabled' : 'disabled'}")
        ${mixEnable ? `print(f"  Mix cycles: ${mixCycles}")` : ''}
        print(f"  Aspiration speed: ${aspSpeed}")
        print(f"  Quality control: ${qcEnable ? 'enabled' : 'disabled'}")
        
        # Simulate liquid handling operations
        import time
        
        # Simulate tip pickup
        print("    Picking up tips...")
        time.sleep(2)
        
        # Simulate liquid transfers
        volume_data = protocol.get_variable('${volumeMap}', [50, 100, 25])  # Default volumes
        if isinstance(volume_data, list):
            for i, volume in enumerate(volume_data):
                print(f"    Transferring {volume} μL to well {i+1}")
                time.sleep(1)
                
                ${mixEnable ? `
                # Mixing
                for cycle in range(${mixCycles}):
                    print(f"      Mix cycle {cycle + 1}")
                    time.sleep(0.5)
                ` : ''}
        
        ${qcEnable ? `
        # Quality control checks
        print("    Performing quality control...")
        qc_results = {
            'tip_tracking': 'pass',
            'volume_accuracy': 'pass',
            'cross_contamination': 'pass'
        }
        print(f"    QC Results: {qc_results}")
        ` : ''}
        
        # Simulate tip disposal
        print("    Disposing tips...")
        time.sleep(1)
        
        result = {
            'system': '${system}',
            'transfers_completed': len(volume_data) if isinstance(volume_data, list) else 1,
            'total_time': time.time() - self.timestamp.timestamp()
        }
        
        return result

protocol.add_step(LiquidHandlingStep("Liquid Handling", "Automated liquid handling with ${system}"))
`;
    
    return code;
};

// High-Content Imaging generator
PythonGenerator['high_content_imaging'] = function(block) {
    const samplePlate = PythonGenerator.valueToCode(block, 'SAMPLE_PLATE', PythonGenerator.ORDER_NONE) || 'sample_plate';
    const microscope = block.getFieldValue('MICROSCOPE');
    const objective = block.getFieldValue('OBJECTIVE');
    const dapi = block.getFieldValue('DAPI') === 'TRUE';
    const fitc = block.getFieldValue('FITC') === 'TRUE';
    const tritc = block.getFieldValue('TRITC') === 'TRUE';
    const cy5 = block.getFieldValue('CY5') === 'TRUE';
    const fieldsPerWell = PythonGenerator.valueToCode(block, 'FIELDS_PER_WELL', PythonGenerator.ORDER_NONE) || '4';
    const zPlanes = PythonGenerator.valueToCode(block, 'Z_PLANES', PythonGenerator.ORDER_NONE) || '1';
    const analysis = block.getFieldValue('ANALYSIS');
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    const channels = [];
    if (dapi) channels.push('DAPI');
    if (fitc) channels.push('FITC');
    if (tritc) channels.push('TRITC');
    if (cy5) channels.push('Cy5');
    
    const code = `
class HighContentImagingStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  High-Content Imaging")
        print(f"  Sample plate: {${samplePlate}}")
        print(f"  Microscope: ${microscope}")
        print(f"  Objective: ${objective}")
        print(f"  Channels: ${channels.join(', ')}")
        print(f"  Fields per well: {${fieldsPerWell}}")
        print(f"  Z-planes: {${zPlanes}}")
        print(f"  Analysis type: ${analysis}")
        
        # Simulate imaging acquisition
        import numpy as np
        import time
        
        channels = [${channels.map(c => `'${c}'`).join(', ')}]
        wells = 96  # Assume 96-well plate
        fields_per_well = int(${fieldsPerWell})
        z_planes = int(${zPlanes})
        
        total_images = wells * fields_per_well * z_planes * len(channels)
        print(f"  Total images to acquire: {total_images}")
        
        # Simulate acquisition time (1 second per image)
        acquisition_time = total_images * 1
        print(f"  Estimated acquisition time: {acquisition_time/60:.1f} minutes")
        time.sleep(min(acquisition_time, 30))  # Cap simulation time
        
        # Generate mock imaging data
        imaging_data = {
            'plate_id': str(${samplePlate}),
            'microscope': '${microscope}',
            'objective': '${objective}',
            'channels': channels,
            'wells_imaged': wells,
            'fields_per_well': fields_per_well,
            'z_planes': z_planes,
            'total_images': total_images,
            'analysis_type': '${analysis}'
        }
        
        # Simulate analysis results based on type
        if '${analysis}' == 'COUNTING':
            imaging_data['cell_counts'] = np.random.poisson(150, wells).tolist()
        elif '${analysis}' == 'MORPHOLOGY':
            imaging_data['cell_area'] = np.random.normal(250, 50, wells).tolist()
            imaging_data['cell_circularity'] = np.random.uniform(0.6, 0.9, wells).tolist()
        elif '${analysis}' == 'INTENSITY':
            for channel in channels:
                imaging_data[f'{channel.lower()}_intensity'] = np.random.exponential(1000, wells).tolist()
        
        protocol.set_variable('${resultVar}', imaging_data)
        print(f"  Imaging complete. Results stored in: ${resultVar}")
        return {"${resultVar}": imaging_data}

protocol.add_step(HighContentImagingStep("High-Content Imaging", "Automated imaging with ${microscope}"))
`;
    
    return code;
};

// Real-Time PCR generator
PythonGenerator['qpcr_system'] = function(block) {
    const sample = PythonGenerator.valueToCode(block, 'SAMPLE', PythonGenerator.ORDER_NONE) || 'None';
    const system = block.getFieldValue('SYSTEM');
    const volume = block.getFieldValue('VOLUME');
    const chemistry = block.getFieldValue('CHEMISTRY');
    const initialDenatureTemp = PythonGenerator.valueToCode(block, 'INITIAL_DENATURATION_TEMP', PythonGenerator.ORDER_NONE) || '95';
    const initialDenatureTime = PythonGenerator.valueToCode(block, 'INITIAL_DENATURATION_TIME', PythonGenerator.ORDER_NONE) || '10';
    const cycles = PythonGenerator.valueToCode(block, 'CYCLES', PythonGenerator.ORDER_NONE) || '40';
    const denatureTemp = PythonGenerator.valueToCode(block, 'DENATURATION_TEMP', PythonGenerator.ORDER_NONE) || '95';
    const annealingTemp = PythonGenerator.valueToCode(block, 'ANNEALING_TEMP', PythonGenerator.ORDER_NONE) || '60';
    const extensionTemp = PythonGenerator.valueToCode(block, 'EXTENSION_TEMP', PythonGenerator.ORDER_NONE) || '72';
    const meltCurve = block.getFieldValue('MELT_CURVE') === 'TRUE';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    const code = `
class qPCRStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  Real-Time PCR (qPCR)")
        print(f"  Sample: {${sample}}")
        print(f"  System: ${system}")
        print(f"  Reaction volume: ${volume} μL")
        print(f"  Chemistry: ${chemistry}")
        print(f"  Initial denaturation: {${initialDenatureTemp}}°C for {${initialDenatureTime}} min")
        print(f"  PCR cycles: {${cycles}}")
        print(f"  Denaturation: {${denatureTemp}}°C")
        print(f"  Annealing: {${annealingTemp}}°C")
        print(f"  Extension: {${extensionTemp}}°C")
        print(f"  Melt curve: ${meltCurve ? 'enabled' : 'disabled'}")
        
        # Simulate qPCR run
        import numpy as np
        import time
        
        cycles_num = int(${cycles})
        
        # Simulate thermal cycling time
        cycle_time = 3  # minutes per cycle
        total_time = ${initialDenatureTime} + (cycles_num * cycle_time)
        ${meltCurve ? 'total_time += 20  # Add melt curve time' : ''}
        
        print(f"  Estimated run time: {total_time} minutes")
        time.sleep(min(total_time * 60, 60))  # Cap simulation time to 1 minute
        
        # Generate mock qPCR data
        ct_values = np.random.normal(25, 3, 8)  # 8 samples
        ct_values = np.clip(ct_values, 15, 40)  # Realistic CT range
        
        qpcr_data = {
            'system': '${system}',
            'chemistry': '${chemistry}',
            'volume': ${volume},
            'cycles': cycles_num,
            'ct_values': ct_values.tolist(),
            'thermal_profile': {
                'initial_denaturation': {'temp': ${initialDenatureTemp}, 'time': ${initialDenatureTime}},
                'denaturation': ${denatureTemp},
                'annealing': ${annealingTemp},
                'extension': ${extensionTemp}
            }
        }
        
        ${meltCurve ? `
        # Generate mock melt curve data
        temps = np.linspace(60, 95, 100)
        melt_curve_data = np.random.exponential(0.1, len(temps))
        # Add melting peak around 80°C
        peak_idx = np.argmin(np.abs(temps - 80))
        melt_curve_data[peak_idx:peak_idx+5] += np.random.exponential(2, 5)
        
        qpcr_data['melt_curve'] = {
            'temperature': temps.tolist(),
            'derivative': melt_curve_data.tolist()
        }
        ` : ''}
        
        protocol.set_variable('${resultVar}', qpcr_data)
        print(f"  qPCR complete. Results stored in: ${resultVar}")
        print(f"  Average CT value: {np.mean(ct_values):.2f}")
        return {"${resultVar}": qpcr_data}

protocol.add_step(qPCRStep("Real-Time PCR", "qPCR amplification with ${chemistry} chemistry"))
`;
    
    return code;
};

// Next-Generation Sequencing generator
PythonGenerator['ngs_sequencer'] = function(block) {
    const library = PythonGenerator.valueToCode(block, 'LIBRARY', PythonGenerator.ORDER_NONE) || 'None';
    const platform = block.getFieldValue('PLATFORM');
    const readType = block.getFieldValue('READ_TYPE');
    const readLength = PythonGenerator.valueToCode(block, 'READ_LENGTH', PythonGenerator.ORDER_NONE) || '150';
    const kit = block.getFieldValue('KIT');
    const clusterDensity = PythonGenerator.valueToCode(block, 'CLUSTER_DENSITY', PythonGenerator.ORDER_NONE) || '200';
    const coverage = PythonGenerator.valueToCode(block, 'COVERAGE', PythonGenerator.ORDER_NONE) || '30';
    const qcEnable = block.getFieldValue('QC_ENABLE') === 'TRUE';
    const resultVar = block.getFieldValue('RESULT_VAR');
    
    const code = `
class NGSSequencingStep(ProtocolStep):
    def _execute_step(self, **kwargs):
        print(f"  Next-Generation Sequencing")
        print(f"  DNA library: {${library}}")
        print(f"  Platform: ${platform}")
        print(f"  Read type: ${readType}")
        print(f"  Read length: {${readLength}} bp")
        print(f"  Sequencing kit: ${kit}")
        print(f"  Cluster density: {${clusterDensity}} K/mm²")
        print(f"  Target coverage: {${coverage}}X")
        print(f"  Quality control: ${qcEnable ? 'enabled' : 'disabled'}")
        
        # Simulate sequencing run
        import time
        import numpy as np
        
        read_length = int(${readLength})
        coverage = float(${coverage})
        
        # Estimate sequencing time based on platform
        platform_times = {
            'NOVASEQ': 24,  # hours
            'HISEQ': 48,
            'MISEQ': 4,
            'ION': 2,
            'NANOPORE': 12,
            'PACBIO': 8
        }
        
        estimated_time = platform_times.get('${platform}', 24)
        print(f"  Estimated sequencing time: {estimated_time} hours")
        
        # Simulate run (capped for demo)
        time.sleep(min(estimated_time * 3600, 30))  # Cap simulation time
        
        # Calculate estimated reads needed
        genome_size = 3e9  # Human genome size
        reads_needed = (genome_size * coverage) / read_length
        
        sequencing_data = {
            'platform': '${platform}',
            'library': str(${library}),
            'read_type': '${readType}',
            'read_length': read_length,
            'kit': '${kit}',
            'cluster_density': ${clusterDensity},
            'target_coverage': coverage,
            'estimated_reads': int(reads_needed),
            'sequencing_time': estimated_time
        }
        
        ${qcEnable ? `
        # Quality control metrics
        qc_metrics = {
            'cluster_density_pf': np.random.uniform(80, 95),  # % passing filter
            'q30_bases': np.random.uniform(85, 95),  # % Q30 bases
            'error_rate': np.random.uniform(0.1, 0.5),  # % error rate
            'gc_content': np.random.uniform(40, 45)  # % GC content
        }
        sequencing_data['qc_metrics'] = qc_metrics
        print(f"  Quality metrics: Q30={qc_metrics['q30_bases']:.1f}%, Error rate={qc_metrics['error_rate']:.2f}%")
        ` : ''}
        
        # Generate mock read statistics
        sequencing_data['reads_generated'] = int(reads_needed * np.random.uniform(0.8, 1.2))
        sequencing_data['bases_generated'] = sequencing_data['reads_generated'] * read_length
        
        protocol.set_variable('${resultVar}', sequencing_data)
        print(f"  Sequencing complete. {sequencing_data['reads_generated']:,} reads generated")
        print(f"  Results stored in: ${resultVar}")
        return {"${resultVar}": sequencing_data}

protocol.add_step(NGSSequencingStep("NGS Sequencing", "${platform} sequencing with ${readType} reads"))
`;
    
    return code;
};