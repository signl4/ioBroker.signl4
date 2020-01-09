'use strict';

goog.provide('Blockly.JavaScript.Sendto');

goog.require('Blockly.JavaScript');

// --- SendTo signl4 --------------------------------------------------
Blockly.Words['signl4']              = {"en": "signl4",                                          "de": "signl4"};
Blockly.Words['signl4_subject']      = {"en": "subject",                                         "de": "Betreff"};
Blockly.Words['signl4_body']         = {"en": "body",                              				 "de": "Text"};

Blockly.Sendto.blocks['signl4'] =
    '<block type="signl4">'
    + '     <value name="INSTANCE">'
    + '     </value>'
    + '     <value name="SUBJECT">'
    + '         <shadow type="text">'
    + '             <field name="SUBJECT_TEXT">text</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="BODY">'
    + '         <shadow type="text">'
    + '             <field name="BODY_TEXT">text</field>'
    + '         </shadow>'
    + '     </value>'
    + '</block>';

Blockly.Blocks['signl4'] = {
    init: function() {

        this.appendDummyInput("INSTANCE")
            .appendField(Blockly.Words['signl4'][systemLang])
            .appendField(new Blockly.FieldDropdown([[Blockly.Words['signl4_anyInstance'][systemLang], ""], ["signl4.0", ".0"], ["signl4.1", ".1"], ["signl4.2", ".2"], ["signl4.3", ".3"], ["signl4.4", ".4"]]), "INSTANCE");

        this.appendValueInput('BODY')
            .setCheck('String')
            .appendField(Blockly.Words['signl4_body'][systemLang]);

        var input = this.appendValueInput("SUBJECT")
            .setCheck('String')
            .appendField(Blockly.Words['signl4_subject'][systemLang]);
        if (input.connection) input.connection._optional = true;

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
    }
};

Blockly.JavaScript['signl4'] = function(block) {
    var dropdown_instance = block.getFieldValue('INSTANCE');
	
    var message  = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);

    var text = '{\n';
    value = Blockly.JavaScript.valueToCode(block, 'SUBJECT', Blockly.JavaScript.ORDER_ATOMIC);
    if (value && value !== '') text += '   subject: ' + value + ',\n';

    text += '}';
    var logText;

    logText = 'console.' + logLevel + '("signl4: " + ' + message + ');\n'

    return 'sendTo("signl4' + dropdown_instance + '", "send", ' + text + ');\n' + logText;
};
