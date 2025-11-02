// Specialized laboratory equipment blocks

// Flow Cytometer block
Blockly.Blocks['flow_cytometer'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Flow Cytometry Analysis");
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("sample");
        this.appendDummyInput()
            .appendField("laser")
            .appendField(new Blockly.FieldDropdown([
                ["488nm (Blue)", "488"],
                ["405nm (Violet)", "405"],
                ["633nm (Red)", "633"],
                ["561nm (Yellow-Green)", "561"],
                ["355nm (UV)", "355"]
            ]), "LASER");
        this.appendDummyInput()
            .appendField("detector")
            .appendField(new Blockly.FieldDropdown([
                ["FSC (Forward Scatter)", "FSC"],
                ["SSC (Side Scatter)", "SSC"],
                ["FITC (FL1)", "FITC"],
                ["PE (FL2)", "PE"],
                ["PerCP (FL3)", "PERCP"],
                ["APC (FL4)", "APC"],
                ["PE-Cy7", "PE_CY7"],
                ["APC-Cy7", "APC_CY7"]
            ]), "DETECTOR");
        this.appendValueInput("FLOW_RATE")
            .setCheck("Number")
            .appendField("flow rate (μL/min)");
        this.appendValueInput("EVENT_COUNT")
            .setCheck("Number")
            .appendField("events to collect");
        this.appendDummyInput()
            .appendField("gating strategy")
            .appendField(new Blockly.FieldTextInput("live cells"), "GATING");
        this.appendDummyInput()
            .appendField("store results as")
            .appendField(new Blockly.FieldTextInput("flow_data"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Perform flow cytometry analysis");
        this.setHelpUrl("");
    }
};

// Mass Spectrometer block
Blockly.Blocks['mass_spectrometer'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Mass Spectrometry");
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("sample");
        this.appendDummyInput()
            .appendField("ionization")
            .appendField(new Blockly.FieldDropdown([
                ["ESI (Electrospray)", "ESI"],
                ["MALDI (Matrix-Assisted)", "MALDI"],
                ["APCI (Atmospheric Pressure)", "APCI"],
                ["EI (Electron Impact)", "EI"],
                ["CI (Chemical Ionization)", "CI"]
            ]), "IONIZATION");
        this.appendDummyInput()
            .appendField("analyzer")
            .appendField(new Blockly.FieldDropdown([
                ["Quadrupole", "QUAD"],
                ["Time-of-Flight", "TOF"],
                ["Ion Trap", "TRAP"],
                ["Orbitrap", "ORBITRAP"],
                ["Q-TOF", "QTOF"]
            ]), "ANALYZER");
        this.appendDummyInput()
            .appendField("mode")
            .appendField(new Blockly.FieldDropdown([
                ["Positive", "POSITIVE"],
                ["Negative", "NEGATIVE"],
                ["Both", "BOTH"]
            ]), "MODE");
        this.appendValueInput("MASS_RANGE_LOW")
            .setCheck("Number")
            .appendField("mass range (Da) from");
        this.appendValueInput("MASS_RANGE_HIGH")
            .setCheck("Number")
            .appendField("to");
        this.appendValueInput("RESOLUTION")
            .setCheck("Number")
            .appendField("resolution");
        this.appendDummyInput()
            .appendField("store spectrum as")
            .appendField(new Blockly.FieldTextInput("ms_spectrum"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Perform mass spectrometry analysis");
        this.setHelpUrl("");
    }
};

// NMR Spectrometer block
Blockly.Blocks['nmr_spectrometer'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("NMR Spectroscopy");
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("sample");
        this.appendDummyInput()
            .appendField("nucleus")
            .appendField(new Blockly.FieldDropdown([
                ["1H (Proton)", "1H"],
                ["13C (Carbon)", "13C"],
                ["15N (Nitrogen)", "15N"],
                ["31P (Phosphorus)", "31P"],
                ["19F (Fluorine)", "19F"]
            ]), "NUCLEUS");
        this.appendValueInput("FREQUENCY")
            .setCheck("Number")
            .appendField("frequency (MHz)");
        this.appendDummyInput()
            .appendField("experiment type")
            .appendField(new Blockly.FieldDropdown([
                ["1D Standard", "1D"],
                ["2D COSY", "COSY"],
                ["2D HSQC", "HSQC"],
                ["2D NOESY", "NOESY"],
                ["DEPT", "DEPT"],
                ["APT", "APT"]
            ]), "EXPERIMENT");
        this.appendValueInput("PULSE_SEQUENCE")
            .setCheck(null)
            .appendField("pulse sequence");
        this.appendValueInput("ACQUISITION_TIME")
            .setCheck("Number")
            .appendField("acquisition time (min)");
        this.appendDummyInput()
            .appendField("solvent")
            .appendField(new Blockly.FieldDropdown([
                ["CDCl3", "CDCL3"],
                ["D2O", "D2O"],
                ["DMSO-d6", "DMSO"],
                ["CD3OD", "CD3OD"],
                ["Acetone-d6", "ACETONE"]
            ]), "SOLVENT");
        this.appendDummyInput()
            .appendField("store spectrum as")
            .appendField(new Blockly.FieldTextInput("nmr_spectrum"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Perform NMR spectroscopy");
        this.setHelpUrl("");
    }
};

// Automated Liquid Handler block
Blockly.Blocks['liquid_handler'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Automated Liquid Handling");
        this.appendDummyInput()
            .appendField("system")
            .appendField(new Blockly.FieldDropdown([
                ["Hamilton STAR", "HAMILTON"],
                ["Tecan Freedom EVO", "TECAN"],
                ["Beckman Biomek", "BIOMEK"],
                ["Agilent Bravo", "BRAVO"],
                ["Opentrons OT-2", "OPENTRONS"]
            ]), "SYSTEM");
        this.appendValueInput("SOURCE_PLATE")
            .setCheck(null)
            .appendField("source plate");
        this.appendValueInput("DEST_PLATE")
            .setCheck(null)
            .appendField("destination plate");
        this.appendDummyInput()
            .appendField("tip type")
            .appendField(new Blockly.FieldDropdown([
                ["50μL tips", "50UL"],
                ["200μL tips", "200UL"],
                ["1000μL tips", "1000UL"],
                ["filter tips", "FILTER"],
                ["wide bore tips", "WIDE_BORE"]
            ]), "TIP_TYPE");
        this.appendValueInput("VOLUME_MAP")
            .setCheck(null)
            .appendField("volume mapping");
        this.appendDummyInput()
            .appendField("mixing")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "MIX_ENABLE")
            .appendField("cycles")
            .appendField(new Blockly.FieldNumber(3, 0, 10), "MIX_CYCLES");
        this.appendDummyInput()
            .appendField("aspiration speed")
            .appendField(new Blockly.FieldDropdown([
                ["slow", "SLOW"],
                ["medium", "MEDIUM"],
                ["fast", "FAST"],
                ["custom", "CUSTOM"]
            ]), "ASP_SPEED");
        this.appendDummyInput()
            .appendField("quality control")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "QC_ENABLE");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Automated liquid handling operations");
        this.setHelpUrl("");
    }
};

// High-Content Imaging block
Blockly.Blocks['high_content_imaging'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("High-Content Imaging");
        this.appendValueInput("SAMPLE_PLATE")
            .setCheck(null)
            .appendField("sample plate");
        this.appendDummyInput()
            .appendField("microscope")
            .appendField(new Blockly.FieldDropdown([
                ["Opera Phenix", "OPERA"],
                ["ImageXpress", "IMAGEXPRESS"],
                ["IN Cell Analyzer", "INCELL"],
                ["Columbus", "COLUMBUS"],
                ["CellInsight", "CELLINSIGHT"]
            ]), "MICROSCOPE");
        this.appendDummyInput()
            .appendField("objective")
            .appendField(new Blockly.FieldDropdown([
                ["10x", "10X"],
                ["20x", "20X"],
                ["40x", "40X"],
                ["63x", "63X"],
                ["100x", "100X"]
            ]), "OBJECTIVE");
        this.appendDummyInput()
            .appendField("fluorescence channels");
        this.appendDummyInput()
            .appendField("DAPI")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "DAPI")
            .appendField("FITC")
            .appendField(new Blockly.FieldCheckbox("FALSE"), "FITC")
            .appendField("TRITC")
            .appendField(new Blockly.FieldCheckbox("FALSE"), "TRITC")
            .appendField("Cy5")
            .appendField(new Blockly.FieldCheckbox("FALSE"), "CY5");
        this.appendValueInput("FIELDS_PER_WELL")
            .setCheck("Number")
            .appendField("fields per well");
        this.appendValueInput("Z_PLANES")
            .setCheck("Number")
            .appendField("Z-planes");
        this.appendDummyInput()
            .appendField("analysis")
            .appendField(new Blockly.FieldDropdown([
                ["cell counting", "COUNTING"],
                ["morphology", "MORPHOLOGY"],
                ["colocalization", "COLOCALIZATION"],
                ["intensity", "INTENSITY"],
                ["custom script", "CUSTOM"]
            ]), "ANALYSIS");
        this.appendDummyInput()
            .appendField("store results as")
            .appendField(new Blockly.FieldTextInput("imaging_data"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("High-content imaging and analysis");
        this.setHelpUrl("");
    }
};

// Real-Time PCR (qPCR) block
Blockly.Blocks['qpcr_system'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Real-Time PCR (qPCR)");
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("sample");
        this.appendDummyInput()
            .appendField("system")
            .appendField(new Blockly.FieldDropdown([
                ["Applied Biosystems 7500", "ABI7500"],
                ["Bio-Rad CFX96", "CFX96"],
                ["Roche LightCycler", "LIGHTCYCLER"],
                ["Thermo QuantStudio", "QUANTSTUDIO"],
                ["Agilent Mx3005P", "MX3005P"]
            ]), "SYSTEM");
        this.appendDummyInput()
            .appendField("reaction volume (μL)")
            .appendField(new Blockly.FieldNumber(20, 1, 100), "VOLUME");
        this.appendDummyInput()
            .appendField("detection chemistry")
            .appendField(new Blockly.FieldDropdown([
                ["SYBR Green", "SYBR"],
                ["TaqMan probe", "TAQMAN"],
                ["Molecular beacons", "BEACONS"],
                ["FRET probes", "FRET"]
            ]), "CHEMISTRY");
        this.appendValueInput("INITIAL_DENATURATION_TEMP")
            .setCheck("Number")
            .appendField("initial denaturation (°C)");
        this.appendValueInput("INITIAL_DENATURATION_TIME")
            .setCheck("Number")
            .appendField("time (min)");
        this.appendValueInput("CYCLES")
            .setCheck("Number")
            .appendField("PCR cycles");
        this.appendValueInput("DENATURATION_TEMP")
            .setCheck("Number")
            .appendField("denaturation (°C)");
        this.appendValueInput("ANNEALING_TEMP")
            .setCheck("Number")
            .appendField("annealing (°C)");
        this.appendValueInput("EXTENSION_TEMP")
            .setCheck("Number")
            .appendField("extension (°C)");
        this.appendDummyInput()
            .appendField("melt curve analysis")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "MELT_CURVE");
        this.appendDummyInput()
            .appendField("store results as")
            .appendField(new Blockly.FieldTextInput("qpcr_results"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Real-time PCR amplification and analysis");
        this.setHelpUrl("");
    }
};

// Next-Generation Sequencing block
Blockly.Blocks['ngs_sequencer'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Next-Generation Sequencing");
        this.appendValueInput("LIBRARY")
            .setCheck(null)
            .appendField("DNA library");
        this.appendDummyInput()
            .appendField("platform")
            .appendField(new Blockly.FieldDropdown([
                ["Illumina NovaSeq", "NOVASEQ"],
                ["Illumina HiSeq", "HISEQ"],
                ["Illumina MiSeq", "MISEQ"],
                ["Ion Torrent", "ION"],
                ["Oxford Nanopore", "NANOPORE"],
                ["PacBio Sequel", "PACBIO"]
            ]), "PLATFORM");
        this.appendDummyInput()
            .appendField("read type")
            .appendField(new Blockly.FieldDropdown([
                ["Single-end", "SINGLE"],
                ["Paired-end", "PAIRED"]
            ]), "READ_TYPE");
        this.appendValueInput("READ_LENGTH")
            .setCheck("Number")
            .appendField("read length (bp)");
        this.appendDummyInput()
            .appendField("sequencing kit")
            .appendField(new Blockly.FieldDropdown([
                ["v3 chemistry", "V3"],
                ["v4 chemistry", "V4"],
                ["SBS kit", "SBS"],
                ["Rapid kit", "RAPID"]
            ]), "KIT");
        this.appendValueInput("CLUSTER_DENSITY")
            .setCheck("Number")
            .appendField("cluster density (K/mm²)");
        this.appendValueInput("COVERAGE")
            .setCheck("Number")
            .appendField("target coverage (X)");
        this.appendDummyInput()
            .appendField("quality control")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "QC_ENABLE");
        this.appendDummyInput()
            .appendField("store data as")
            .appendField(new Blockly.FieldTextInput("sequencing_data"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Next-generation DNA sequencing");
        this.setHelpUrl("");
    }
};

// Protein Purification System block
Blockly.Blocks['protein_purification'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Protein Purification");
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("protein sample");
        this.appendDummyInput()
            .appendField("system")
            .appendField(new Blockly.FieldDropdown([
                ["AKTA Pure", "AKTA_PURE"],
                ["AKTA Start", "AKTA_START"],
                ["Bio-Rad NGC", "NGC"],
                ["Thermo UltiMate", "ULTIMATE"],
                ["Manual FPLC", "MANUAL"]
            ]), "SYSTEM");
        this.appendDummyInput()
            .appendField("purification method")
            .appendField(new Blockly.FieldDropdown([
                ["Size exclusion", "SEC"],
                ["Ion exchange", "IEX"],
                ["Hydrophobic interaction", "HIC"],
                ["Affinity chromatography", "AFFINITY"],
                ["Reverse phase", "RP"]
            ]), "METHOD");
        this.appendValueInput("COLUMN")
            .setCheck(null)
            .appendField("column");
        this.appendValueInput("FLOW_RATE")
            .setCheck("Number")
            .appendField("flow rate (mL/min)");
        this.appendValueInput("BUFFER_A")
            .setCheck(null)
            .appendField("buffer A");
        this.appendValueInput("BUFFER_B")
            .setCheck(null)
            .appendField("buffer B");
        this.appendDummyInput()
            .appendField("gradient")
            .appendField(new Blockly.FieldDropdown([
                ["Linear", "LINEAR"],
                ["Step", "STEP"],
                ["Isocratic", "ISOCRATIC"],
                ["Custom", "CUSTOM"]
            ]), "GRADIENT");
        this.appendValueInput("FRACTION_SIZE")
            .setCheck("Number")
            .appendField("fraction size (mL)");
        this.appendDummyInput()
            .appendField("detection")
            .appendField(new Blockly.FieldDropdown([
                ["UV 280nm", "UV280"],
                ["UV 260nm", "UV260"],
                ["Conductivity", "CONDUCTIVITY"],
                ["pH", "PH"]
            ]), "DETECTION");
        this.appendDummyInput()
            .appendField("store fractions as")
            .appendField(new Blockly.FieldTextInput("purified_protein"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Automated protein purification");
        this.setHelpUrl("");
    }
};

// Cell Sorter block
Blockly.Blocks['cell_sorter'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Fluorescence-Activated Cell Sorting (FACS)");
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("cell sample");
        this.appendDummyInput()
            .appendField("sorter")
            .appendField(new Blockly.FieldDropdown([
                ["BD FACSAria", "FACSARIA"],
                ["BD Influx", "INFLUX"],
                ["Sony SH800", "SH800"],
                ["Bio-Rad S3e", "S3E"],
                ["Beckman MoFlo", "MOFLO"]
            ]), "SORTER");
        this.appendValueInput("FLOW_RATE")
            .setCheck("Number")
            .appendField("flow rate (events/sec)");
        this.appendDummyInput()
            .appendField("nozzle size (μm)")
            .appendField(new Blockly.FieldDropdown([
                ["70", "70"],
                ["85", "85"],
                ["100", "100"],
                ["130", "130"]
            ]), "NOZZLE");
        this.appendDummyInput()
            .appendField("sort precision")
            .appendField(new Blockly.FieldDropdown([
                ["Single cell", "SINGLE"],
                ["Purity", "PURITY"],
                ["Yield", "YIELD"],
                ["4-way purity", "4WAY"]
            ]), "PRECISION");
        this.appendStatementInput("SORT_GATES")
            .setCheck(null)
            .appendField("sorting gates");
        this.appendValueInput("COLLECTION_TUBE")
            .setCheck(null)
            .appendField("collection tube");
        this.appendDummyInput()
            .appendField("post-sort analysis")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "POST_ANALYSIS");
        this.appendDummyInput()
            .appendField("store sorted cells as")
            .appendField(new Blockly.FieldTextInput("sorted_cells"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Fluorescence-activated cell sorting");
        this.setHelpUrl("");
    }
};

// Automated Western Blot block
Blockly.Blocks['automated_western'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Automated Western Blot");
        this.appendValueInput("PROTEIN_SAMPLE")
            .setCheck(null)
            .appendField("protein sample");
        this.appendDummyInput()
            .appendField("system")
            .appendField(new Blockly.FieldDropdown([
                ["Bio-Rad ChemiDoc", "CHEMIDOC"],
                ["LI-COR Odyssey", "ODYSSEY"],
                ["ProteinSimple Wes", "WES"],
                ["Azure Sapphire", "SAPPHIRE"]
            ]), "SYSTEM");
        this.appendDummyInput()
            .appendField("gel type")
            .appendField(new Blockly.FieldDropdown([
                ["4-12% Bis-Tris", "BIS_TRIS"],
                ["4-20% Tris-Glycine", "TRIS_GLYCINE"],
                ["12% Tris-HCl", "TRIS_HCL"],
                ["Any kD", "ANY_KD"]
            ]), "GEL_TYPE");
        this.appendValueInput("SAMPLE_VOLUME")
            .setCheck("Number")
            .appendField("sample volume (μL)");
        this.appendValueInput("PRIMARY_ANTIBODY")
            .setCheck(null)
            .appendField("primary antibody");
        this.appendValueInput("PRIMARY_DILUTION")
            .setCheck(null)
            .appendField("dilution");
        this.appendValueInput("SECONDARY_ANTIBODY")
            .setCheck(null)
            .appendField("secondary antibody");
        this.appendDummyInput()
            .appendField("detection method")
            .appendField(new Blockly.FieldDropdown([
                ["Chemiluminescence", "ECL"],
                ["Fluorescence", "FLUORESCENCE"],
                ["Colorimetric", "COLORIMETRIC"]
            ]), "DETECTION");
        this.appendValueInput("EXPOSURE_TIME")
            .setCheck("Number")
            .appendField("exposure time (sec)");
        this.appendDummyInput()
            .appendField("store blot as")
            .appendField(new Blockly.FieldTextInput("western_blot"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Automated western blot analysis");
        this.setHelpUrl("");
    }
};