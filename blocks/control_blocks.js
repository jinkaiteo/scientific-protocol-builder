// Control flow and protocol management blocks

// Protocol sequence block
Blockly.Blocks['protocol_sequence'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Protocol Sequence:")
            .appendField(new Blockly.FieldTextInput("sequence1"), "NAME");
        this.appendStatementInput("STEPS")
            .setCheck(null)
            .appendField("steps");
        this.appendDummyInput()
            .appendField("description")
            .appendField(new Blockly.FieldTextInput(""), "DESCRIPTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Define a sequence of protocol steps");
        this.setHelpUrl("");
    }
};

// Parallel steps block
Blockly.Blocks['parallel_steps'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Run in parallel:");
        this.appendStatementInput("BRANCH1")
            .setCheck(null)
            .appendField("branch 1");
        this.appendStatementInput("BRANCH2")
            .setCheck(null)
            .appendField("branch 2");
        this.appendStatementInput("BRANCH3")
            .setCheck(null)
            .appendField("branch 3 (optional)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Execute multiple steps simultaneously");
        this.setHelpUrl("");
    }
};

// Protocol definition block
Blockly.Blocks['protocol_definition'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Define Protocol:")
            .appendField(new Blockly.FieldTextInput("my_protocol"), "PROTOCOL_NAME");
        this.appendStatementInput("INPUTS")
            .setCheck(null)
            .appendField("inputs");
        this.appendStatementInput("STEPS")
            .setCheck(null)
            .appendField("protocol steps");
        this.appendStatementInput("OUTPUTS")
            .setCheck(null)
            .appendField("outputs");
        this.appendDummyInput()
            .appendField("description")
            .appendField(new Blockly.FieldTextInput(""), "DESCRIPTION");
        this.setColour(300);
        this.setTooltip("Define a reusable protocol");
        this.setHelpUrl("");
    }
};

// Protocol call block
Blockly.Blocks['protocol_call'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Run Protocol:")
            .appendField(new Blockly.FieldTextInput("protocol_name"), "PROTOCOL_NAME");
        this.appendStatementInput("PARAMETERS")
            .setCheck(null)
            .appendField("with parameters");
        this.appendDummyInput()
            .appendField("store results in")
            .appendField(new Blockly.FieldTextInput("results"), "RESULT_VAR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
        this.setTooltip("Call a previously defined protocol");
        this.setHelpUrl("");
        this.setOutput(true, null);
    }
};

// Protocol input block
Blockly.Blocks['protocol_input'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Protocol Input:")
            .appendField(new Blockly.FieldTextInput("input_name"), "INPUT_NAME");
        this.appendDummyInput()
            .appendField("type")
            .appendField(new Blockly.FieldDropdown([
                ["sample", "SAMPLE"],
                ["reagent", "REAGENT"],
                ["equipment", "EQUIPMENT"],
                ["number", "NUMBER"],
                ["text", "TEXT"],
                ["boolean", "BOOLEAN"]
            ]), "INPUT_TYPE");
        this.appendDummyInput()
            .appendField("required")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "REQUIRED");
        this.appendValueInput("DEFAULT_VALUE")
            .setCheck(null)
            .appendField("default value");
        this.appendDummyInput()
            .appendField("description")
            .appendField(new Blockly.FieldTextInput(""), "DESCRIPTION");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
        this.setTooltip("Define an input parameter for a protocol");
        this.setHelpUrl("");
    }
};

// Protocol output block
Blockly.Blocks['protocol_output'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Protocol Output:")
            .appendField(new Blockly.FieldTextInput("output_name"), "OUTPUT_NAME");
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("value");
        this.appendDummyInput()
            .appendField("type")
            .appendField(new Blockly.FieldDropdown([
                ["sample", "SAMPLE"],
                ["measurement", "MEASUREMENT"],
                ["observation", "OBSERVATION"],
                ["number", "NUMBER"],
                ["text", "TEXT"],
                ["boolean", "BOOLEAN"]
            ]), "OUTPUT_TYPE");
        this.appendDummyInput()
            .appendField("description")
            .appendField(new Blockly.FieldTextInput(""), "DESCRIPTION");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
        this.setTooltip("Define an output from a protocol");
        this.setHelpUrl("");
    }
};

// Conditional execution block
Blockly.Blocks['conditional_step'] = {
    init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("if");
        this.appendStatementInput("THEN_STEPS")
            .setCheck(null)
            .appendField("then execute");
        this.appendStatementInput("ELSE_STEPS")
            .setCheck(null)
            .appendField("else execute");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Execute steps conditionally based on a condition");
        this.setHelpUrl("");
    }
};

// Quality control check block
Blockly.Blocks['quality_check'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Quality Check:")
            .appendField(new Blockly.FieldTextInput("check_name"), "CHECK_NAME");
        this.appendValueInput("SAMPLE")
            .setCheck(null)
            .appendField("sample");
        this.appendValueInput("EXPECTED")
            .setCheck(null)
            .appendField("expected");
        this.appendValueInput("TOLERANCE")
            .setCheck("Number")
            .appendField("tolerance (%)");
        this.appendDummyInput()
            .appendField("action on failure")
            .appendField(new Blockly.FieldDropdown([
                ["stop protocol", "STOP"],
                ["continue with warning", "WARN"],
                ["repeat step", "REPEAT"],
                ["skip to next", "SKIP"]
            ]), "FAILURE_ACTION");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Perform quality control checks");
        this.setHelpUrl("");
        this.setOutput(true, "Boolean");
    }
};

// Wait/delay block
Blockly.Blocks['wait_step'] = {
    init: function() {
        this.appendValueInput("TIME")
            .setCheck("Number")
            .appendField("Wait for");
        this.appendDummyInput()
            .appendField("units")
            .appendField(new Blockly.FieldDropdown([
                ["seconds", "SECONDS"],
                ["minutes", "MINUTES"],
                ["hours", "HOURS"]
            ]), "TIME_UNITS");
        this.appendDummyInput()
            .appendField("reason")
            .appendField(new Blockly.FieldTextInput("equilibration"), "REASON");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Wait for a specified amount of time");
        this.setHelpUrl("");
    }
};

// Checkpoint block
Blockly.Blocks['checkpoint'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Checkpoint:")
            .appendField(new Blockly.FieldTextInput("checkpoint1"), "NAME");
        this.appendDummyInput()
            .appendField("description")
            .appendField(new Blockly.FieldTextInput(""), "DESCRIPTION");
        this.appendDummyInput()
            .appendField("require manual confirmation")
            .appendField(new Blockly.FieldCheckbox("FALSE"), "MANUAL_CONFIRM");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Mark important points in the protocol");
        this.setHelpUrl("");
    }
};