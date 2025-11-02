// Scientific experiment step blocks

// Preparation step block
Blockly.Blocks['preparation_step'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Prepare")
            .appendField(new Blockly.FieldTextInput("sample"), "WHAT")
            .appendField("using")
            .appendField(new Blockly.FieldTextInput("method"), "METHOD");
        this.appendValueInput("MATERIALS")
            .setCheck(null)
            .appendField("with materials");
        this.appendValueInput("CONDITIONS")
            .setCheck(null)
            .appendField("under conditions");
        this.appendStatementInput("SUBSTEPS")
            .setCheck(null)
            .appendField("detailed steps");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Prepare samples or materials for the experiment");
        this.setHelpUrl("");
    }
};

// Mixing step block
Blockly.Blocks['mixing_step'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Mix")
            .appendField(new Blockly.FieldTextInput("components"), "COMPONENTS");
        this.appendValueInput("VOLUME")
            .setCheck("Number")
            .appendField("volume (μL)");
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField("speed (rpm)");
        this.appendValueInput("TIME")
            .setCheck("Number")
            .appendField("time (min)");
        this.appendDummyInput()
            .appendField("method")
            .appendField(new Blockly.FieldDropdown([
                ["vortex", "VORTEX"],
                ["pipette", "PIPETTE"],
                ["magnetic stirrer", "MAGNETIC"],
                ["manual", "MANUAL"]
            ]), "METHOD");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Mix components together");
        this.setHelpUrl("");
    }
};

// Incubation step block
Blockly.Blocks['incubation_step'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Incubate")
            .appendField(new Blockly.FieldTextInput("sample"), "SAMPLE");
        this.appendValueInput("TEMPERATURE")
            .setCheck("Number")
            .appendField("at temperature (°C)");
        this.appendValueInput("TIME")
            .setCheck("Number")
            .appendField("for time (min)");
        this.appendDummyInput()
            .appendField("conditions")
            .appendField(new Blockly.FieldDropdown([
                ["static", "STATIC"],
                ["shaking", "SHAKING"],
                ["rotating", "ROTATING"]
            ]), "CONDITIONS");
        this.appendValueInput("HUMIDITY")
            .setCheck("Number")
            .appendField("humidity (%)");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Incubate samples under specific conditions");
        this.setHelpUrl("");
    }
};

// Measurement step block
Blockly.Blocks['measurement_step'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Measure")
            .appendField(new Blockly.FieldDropdown([
                ["absorbance", "ABSORBANCE"],
                ["fluorescence", "FLUORESCENCE"],
                ["luminescence", "LUMINESCENCE"],
                ["pH", "PH"],
                ["conductivity", "CONDUCTIVITY"],
                ["temperature", "TEMPERATURE"],
                ["volume", "VOLUME"],
                ["mass", "MASS"],
                ["optical density", "OD"]
            ]), "MEASUREMENT_TYPE");
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("of sample");
        this.appendValueInput("WAVELENGTH")
            .setCheck("Number")
            .appendField("wavelength (nm)");
        this.appendDummyInput()
            .appendField("store result as")
            .appendField(new Blockly.FieldTextInput("result"), "RESULT_VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Take measurements from samples");
        this.setHelpUrl("");
        this.setOutput(true, "Number");
    }
};

// Transfer step block
Blockly.Blocks['transfer_step'] = {
    init: function() {
        this.appendValueInput("SOURCE")
            .setCheck(null)
            .appendField("Transfer from");
        this.appendValueInput("DESTINATION")
            .setCheck(null)
            .appendField("to");
        this.appendValueInput("VOLUME")
            .setCheck("Number")
            .appendField("volume (μL)");
        this.appendDummyInput()
            .appendField("using")
            .appendField(new Blockly.FieldDropdown([
                ["pipette", "PIPETTE"],
                ["syringe", "SYRINGE"],
                ["dispenser", "DISPENSER"],
                ["pour", "POUR"]
            ]), "METHOD");
        this.appendDummyInput()
            .appendField("tip type")
            .appendField(new Blockly.FieldDropdown([
                ["standard", "STANDARD"],
                ["filter", "FILTER"],
                ["low retention", "LOW_RETENTION"],
                ["wide bore", "WIDE_BORE"]
            ]), "TIP_TYPE");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Transfer liquids between containers");
        this.setHelpUrl("");
    }
};

// Centrifuge step block
Blockly.Blocks['centrifuge_step'] = {
    init: function() {
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("Centrifuge");
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField("at speed (rpm)");
        this.appendValueInput("TIME")
            .setCheck("Number")
            .appendField("for time (min)");
        this.appendValueInput("TEMPERATURE")
            .setCheck("Number")
            .appendField("at temperature (°C)");
        this.appendDummyInput()
            .appendField("acceleration")
            .appendField(new Blockly.FieldDropdown([
                ["fast", "FAST"],
                ["slow", "SLOW"],
                ["gradual", "GRADUAL"]
            ]), "ACCELERATION");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Centrifuge samples");
        this.setHelpUrl("");
    }
};

// Wash step block
Blockly.Blocks['wash_step'] = {
    init: function() {
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("Wash");
        this.appendValueInput("BUFFER")
            .setCheck(null)
            .appendField("with buffer");
        this.appendValueInput("VOLUME")
            .setCheck("Number")
            .appendField("volume (μL)");
        this.appendValueInput("CYCLES")
            .setCheck("Number")
            .appendField("wash cycles");
        this.appendDummyInput()
            .appendField("method")
            .appendField(new Blockly.FieldDropdown([
                ["aspiration", "ASPIRATION"],
                ["centrifugation", "CENTRIFUGATION"],
                ["filtration", "FILTRATION"],
                ["decanting", "DECANTING"]
            ]), "METHOD");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Wash samples to remove unwanted substances");
        this.setHelpUrl("");
    }
};

// Observation step block
Blockly.Blocks['observation_step'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Observe")
            .appendField(new Blockly.FieldTextInput("sample"), "SAMPLE");
        this.appendDummyInput()
            .appendField("look for")
            .appendField(new Blockly.FieldTextInput("changes"), "OBSERVATION");
        this.appendDummyInput()
            .appendField("record as")
            .appendField(new Blockly.FieldTextInput("observation"), "RECORD_VAR");
        this.appendValueInput("TIME")
            .setCheck("Number")
            .appendField("observation time (min)");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Make visual or manual observations");
        this.setHelpUrl("");
        this.setOutput(true, "String");
    }
};