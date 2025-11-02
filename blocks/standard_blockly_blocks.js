// Standard Blockly blocks needed for the protocol builder

// Math number block
Blockly.Blocks['math_number'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), 'NUM');
        this.setOutput(true, 'Number');
        this.setColour(230);
        this.setTooltip('A number.');
        this.setHelpUrl('');
    }
};

// Text block
Blockly.Blocks['text'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput(''), 'TEXT');
        this.setOutput(true, 'String');
        this.setColour(160);
        this.setTooltip('A text string.');
        this.setHelpUrl('');
    }
};

// Boolean block
Blockly.Blocks['logic_boolean'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([['true', 'TRUE'], ['false', 'FALSE']]), 'BOOL');
        this.setOutput(true, 'Boolean');
        this.setColour(210);
        this.setTooltip('Returns either true or false.');
        this.setHelpUrl('');
    }
};

// Logic compare block
Blockly.Blocks['logic_compare'] = {
    init: function() {
        this.appendValueInput('A')
            .setCheck(null);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ['=', 'EQ'],
                ['≠', 'NEQ'],
                ['<', 'LT'],
                ['≤', 'LTE'],
                ['>', 'GT'],
                ['≥', 'GTE']
            ]), 'OP');
        this.appendValueInput('B')
            .setCheck(null);
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setColour(210);
        this.setTooltip('Compare two values.');
        this.setHelpUrl('');
    }
};

// Logic operation block
Blockly.Blocks['logic_operation'] = {
    init: function() {
        this.appendValueInput('A')
            .setCheck('Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([['and', 'AND'], ['or', 'OR']]), 'OP');
        this.appendValueInput('B')
            .setCheck('Boolean');
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setColour(210);
        this.setTooltip('Combine two boolean values.');
        this.setHelpUrl('');
    }
};

// Logic negate block
Blockly.Blocks['logic_negate'] = {
    init: function() {
        this.appendValueInput('BOOL')
            .setCheck('Boolean')
            .appendField('not');
        this.setOutput(true, 'Boolean');
        this.setColour(210);
        this.setTooltip('Returns true if the input is false. Returns false if the input is true.');
        this.setHelpUrl('');
    }
};

// Math arithmetic block
Blockly.Blocks['math_arithmetic'] = {
    init: function() {
        this.appendValueInput('A')
            .setCheck('Number');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ['+', 'ADD'],
                ['-', 'MINUS'],
                ['×', 'MULTIPLY'],
                ['÷', 'DIVIDE'],
                ['^', 'POWER']
            ]), 'OP');
        this.appendValueInput('B')
            .setCheck('Number');
        this.setInputsInline(true);
        this.setOutput(true, 'Number');
        this.setColour(230);
        this.setTooltip('Mathematical operations.');
        this.setHelpUrl('');
    }
};

// Controls if block
Blockly.Blocks['controls_if'] = {
    init: function() {
        this.appendValueInput('IF0')
            .setCheck('Boolean')
            .appendField('if');
        this.appendStatementInput('DO0')
            .appendField('do');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip('If a value is true, then do some statements.');
        this.setHelpUrl('');
        this.setMutator(new Blockly.Mutator(['controls_if_elseif', 'controls_if_else']));
        this.elseifCount_ = 0;
        this.elseCount_ = 0;
    },
    
    mutationToDom: function() {
        if (!this.elseifCount_ && !this.elseCount_) {
            return null;
        }
        var container = document.createElement('mutation');
        if (this.elseifCount_) {
            container.setAttribute('elseif', this.elseifCount_);
        }
        if (this.elseCount_) {
            container.setAttribute('else', 1);
        }
        return container;
    },
    
    domToMutation: function(xmlElement) {
        this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif')) || 0;
        this.elseCount_ = parseInt(xmlElement.getAttribute('else')) || 0;
        this.updateShape_();
    },
    
    updateShape_: function() {
        // Delete everything.
        if (this.getInput('ELSE')) {
            this.removeInput('ELSE');
        }
        var i = 1;
        while (this.getInput('IF' + i)) {
            this.removeInput('IF' + i);
            this.removeInput('DO' + i);
            i++;
        }
        // Rebuild block.
        for (var i = 1; i <= this.elseifCount_; i++) {
            this.appendValueInput('IF' + i)
                .setCheck('Boolean')
                .appendField('else if');
            this.appendStatementInput('DO' + i)
                .appendField('do');
        }
        if (this.elseCount_) {
            this.appendStatementInput('ELSE')
                .appendField('else');
        }
    }
};

// Controls repeat block
Blockly.Blocks['controls_repeat_ext'] = {
    init: function() {
        this.appendValueInput('TIMES')
            .setCheck('Number')
            .appendField('repeat');
        this.appendDummyInput()
            .appendField('times');
        this.appendStatementInput('DO')
            .appendField('do');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip('Do some statements several times.');
        this.setHelpUrl('');
    }
};

// Controls while/until block
Blockly.Blocks['controls_whileUntil'] = {
    init: function() {
        this.appendValueInput('BOOL')
            .setCheck('Boolean')
            .appendField(new Blockly.FieldDropdown([['while', 'WHILE'], ['until', 'UNTIL']]), 'MODE');
        this.appendStatementInput('DO')
            .appendField('do');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip('While a value is true, then do some statements.');
        this.setHelpUrl('');
    }
};

// Controls for block
Blockly.Blocks['controls_for'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('count with')
            .appendField(new Blockly.FieldVariable('i'), 'VAR');
        this.appendValueInput('FROM')
            .setCheck('Number')
            .appendField('from');
        this.appendValueInput('TO')
            .setCheck('Number')
            .appendField('to');
        this.appendValueInput('BY')
            .setCheck('Number')
            .appendField('by');
        this.appendStatementInput('DO')
            .appendField('do');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip('Count from a start number to an end number.');
        this.setHelpUrl('');
    }
};