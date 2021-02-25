import {Assembler} from "../../../src/Assembler";
import {TestHelper} from "../../TestHelper";

function toHex(value, len) {
    let hex = value.toString(16);
    while(hex.length < len) {
        hex = '0' + hex;
    }
}

export const AssemblyValidator = {
    toAssembleTo: function(){
        return {
            compare: function(program, expectedResult) {
                const result = {pass: true, message:'passed'};

                const assembler = new Assembler();
                assembler.assemble(program);
                const obj = assembler.obj;
                const section = obj.getSection('text');

                const lines = expectedResult.split('\n');

                for(let line of lines) {

                    if(/\.text/.test(line)) {
                        const section = obj.getSection('text');
                        continue;
                    }

                    if(/\.data/.test(line)) {
                        const section = obj.getSection('data');
                        continue;
                    }

                    let match = line.match(/\.global\s*([a-zA-Z][a-zA-Z0-9_]*)/)
                    if(match !== null) {
                        const symbol = section.getSymbol(match[1]);
                        if(symbol === null) {
                            result.pass = false;
                            result.message = 'Expected section ' + section.name + ' to have symbol ' +
                                match[1];
                            return result;
                        }

                        if(!symbol.global) {
                            result.pass = false;
                            result.message = 'Expected section ' + section.name + ' symbol ' +
                                match[1] + ' to be global'
                            return result;
                        }

                        continue;
                    }

                    match = line.match(/[0-9]+\s*([0-9a-fA-F]*)\s*([0-9a-fA-F]*)/)
                    if(match !== null) {
                        let addr = parseInt(match[1], 16);
                        let hex = match[2];
                        while(hex.length >= 2) {
                            const byte = parseInt(hex[0] + hex[1], 16);
                            hex = hex.substr(2);

                            const data = section.data;

                            if(addr >= data.length) {
                                result.pass = false;
                                result.message = 'Expected section .' + section.name + ' address ' +
                                    TestHelper.toHex(addr, 4) +
                                    ' which was not emitted to be ' +
                                    TestHelper.toHex(byte, 2) + " in:" + line;
                                return result;
                            }

                            if(data[addr] !== byte) {
                                result.pass = false;
                                result.message = 'Expected section .' + section.name + ' ' +
                                    TestHelper.toHex(addr, 4) +
                                    ': ' + TestHelper.toHex(data[addr], 2) + ' to be ' +
                                    TestHelper.toHex(byte, 2) + " in:" + line;
                                return result;
                            }

                            addr++;
                        }
                    }
                }

                // There should not be any errors
                const errors = assembler.errors;
                if(errors.length > 0) {
                    result.pass = false;
                    result.message = 'Expected no errors, got: ' + errors[0].message();
                }

                return result;
            }
        }
    },
    toHaveErrors: function() {
        return {
            compare: function (program, expectedErrors) {
                const result = {pass: true, message: 'passed'};

                const assembler = new Assembler();
                assembler.assemble(program);
                const errors = assembler.errors;

                let i=0;
                for( ; i<expectedErrors.length; i++) {
                    if(errors.length < (i+1) || errors[i].code !== expectedErrors[i]) {
                        result.pass = false;
                        const actual = errors.length < (i+1) ? 'which is missing' : errors[i].code;
                        result.message = 'Expected error ' + (i+1) + ': ' + actual +
                            ' to be ' + expectedErrors[i];
                        return result;
                    }
                }

                if(i < errors.length) {
                    // We have more errors than we should?
                    result.pass = false;
                    const actual = errors[i].code;
                    result.message = 'Expected error ' + (i+1) + ': ' + actual +
                        ' is an unexpected error ';
                    return result;
                }

                return result;
            }
        }
    }
}