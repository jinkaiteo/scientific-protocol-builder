// Variable and material definition blocks

// Sample variable block
Blockly.Blocks['sample_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Sample:")
            .appendField(new Blockly.FieldTextInput("sample1"), "NAME");
        this.appendValueInput("VOLUME")
            .setCheck("Number")
            .appendField("volume (μL)");
        this.appendValueInput("CONCENTRATION")
            .setCheck("Number")
            .appendField("concentration");
        this.appendDummyInput()
            .appendField("type")
            .appendField(new Blockly.FieldDropdown([
                ["DNA", "DNA"],
                ["RNA", "RNA"],
                ["protein", "PROTEIN"],
                ["cell culture", "CELLS"],
                ["buffer", "BUFFER"],
                ["serum", "SERUM"],
                ["plasma", "PLASMA"],
                ["tissue", "TISSUE"],
                ["other", "OTHER"]
            ]), "TYPE");
        this.appendDummyInput()
            .appendField("description")
            .appendField(new Blockly.FieldTextInput(""), "DESCRIPTION");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Define a biological sample");
        this.setHelpUrl("");
        this.setOutput(true, "Sample");
    }
};

// Reagent variable block
Blockly.Blocks['reagent_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Reagent:")
            .appendField(new Blockly.FieldTextInput("reagent1"), "NAME");
        this.appendValueInput("CONCENTRATION")
            .setCheck("Number")
            .appendField("concentration");
        this.appendDummyInput()
            .appendField("units")
            .appendField(new Blockly.FieldDropdown([
                ["M", "M"],
                ["mM", "mM"],
                ["μM", "μM"],
                ["nM", "nM"],
                ["mg/mL", "mg/mL"],
                ["μg/mL", "μg/mL"],
                ["ng/mL", "ng/mL"],
                ["% (w/v)", "PERCENT_WV"],
                ["% (v/v)", "PERCENT_VV"],
                ["X", "X"]
            ]), "UNITS");
        this.appendValueInput("VOLUME")
            .setCheck("Number")
            .appendField("volume (μL)");
        this.appendDummyInput()
            .appendField("storage")
            .appendField(new Blockly.FieldDropdown([
                ["room temperature", "RT"],
                ["4°C", "4C"],
                ["-20°C", "-20C"],
                ["-80°C", "-80C"],
                ["ice", "ICE"]
            ]), "STORAGE");
        this.appendDummyInput()
            .appendField("description")
            .appendField(new Blockly.FieldTextInput(""), "DESCRIPTION");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Define a chemical reagent");
        this.setHelpUrl("");
        this.setOutput(true, "Reagent");
    }
};

// Equipment variable block
Blockly.Blocks['equipment_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Equipment:")
            .appendField(new Blockly.FieldTextInput("equipment1"), "NAME");
        this.appendDummyInput()
            .appendField("type")
            .appendField(new Blockly.FieldDropdown([
                ["pipette", "PIPETTE"],
                ["centrifuge", "CENTRIFUGE"],
                ["incubator", "INCUBATOR"],
                ["thermocycler", "THERMOCYCLER"],
                ["plate reader", "PLATE_READER"],
                ["microscope", "MICROSCOPE"],
                ["shaker", "SHAKER"],
                ["vortex", "VORTEX"],
                ["balance", "BALANCE"],
                ["pH meter", "PH_METER"],
                ["spectrophotometer", "SPECTROPHOTOMETER"],
                ["other", "OTHER"]
            ]), "TYPE");
        this.appendDummyInput()
            .appendField("model")
            .appendField(new Blockly.FieldTextInput(""), "MODEL");
        this.appendDummyInput()
            .appendField("settings")
            .appendField(new Blockly.FieldTextInput(""), "SETTINGS");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Define laboratory equipment");
        this.setHelpUrl("");
        this.setOutput(true, "Equipment");
    }
};

// Parameter variable block
Blockly.Blocks['parameter_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Parameter:")
            .appendField(new Blockly.FieldTextInput("param1"), "NAME");
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("value");
        this.appendDummyInput()
            .appendField("type")
            .appendField(new Blockly.FieldDropdown([
                ["number", "NUMBER"],
                ["text", "TEXT"],
                ["boolean", "BOOLEAN"],
                ["time", "TIME"],
                ["temperature", "TEMPERATURE"],
                ["volume", "VOLUME"],
                ["concentration", "CONCENTRATION"]
            ]), "TYPE");
        this.appendDummyInput()
            .appendField("units")
            .appendField(new Blockly.FieldTextInput(""), "UNITS");
        this.appendDummyInput()
            .appendField("description")
            .appendField(new Blockly.FieldTextInput(""), "DESCRIPTION");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Define an experimental parameter");
        this.setHelpUrl("");
        this.setOutput(true, null);
    }
};

// Get variable block
Blockly.Blocks['get_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("get")
            .appendField(new Blockly.FieldTextInput("variable"), "VAR_NAME");
        this.setOutput(true, null);
        this.setColour(120);
        this.setTooltip("Get the value of a variable");
        this.setHelpUrl("");
    }
};

// Set variable block
Blockly.Blocks['set_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("set")
            .appendField(new Blockly.FieldTextInput("variable"), "VAR_NAME")
            .appendField("to");
        this.appendValueInput("VALUE")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Set the value of a variable");
        this.setHelpUrl("");
    }
};