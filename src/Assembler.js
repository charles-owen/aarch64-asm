import {ElfObj} from 'elf-obj';

import {Options} from './Options';
import {Lexer} from './Lexer';
import {Token} from './Token';
import {PrettyPrint} from './PrettyPrint';
import {SymbolTable} from "./SymbolTable";
import {AssemblerError} from "./Error";

import {RET} from "./Instructions/RET";
import {NOP} from "./Instructions/NOP";
import {ADD_SUB} from "./Instructions/ADD_SUB";
import {ADC_SBC} from "./Instructions/ADC_SBC";
import {MOV} from "./Instructions/MOV";
import {B} from './Instructions/B';
import {AND_ORR_EOR} from "./Instructions/AND_ORR_EOR";
import {ORN_BIC_EON} from "./Instructions/ORN_BIC_EON";
import {TST} from "./Instructions/TST";
import {CMP_CMN} from "./Instructions/CMP_CMN"
import {MRS_MSR} from "./Instructions/MRS_MSR";
import {LSR_LSL_ASR_ROR} from "./Instructions/LSR_LSL_ASR_ROR";
import {SBFM_UBFM} from "./Instructions/SBFM_UBFM";
import {LDP_STP} from "./Instructions/LDP_STP";

import {GLOBAL} from "./Directives/GLOBAL";
import {TEXT} from "./Directives/TEXT";
import {DATA} from "./Directives/DATA";

/**
 * Constructor
 * @param options
 * @constructor
 */
export const Assembler = function(options) {
    // The Options object that manages user options
    this.options = new Options(options);

    // The ElfObj object that is the destination
    // for the assembly.
    this.obj = null;

    // The current target section
    let section = null;

    // Any assembler errors
    this.errors = [];

    let pass = 1;
    let lineNum = 0;
    let lineBytes = [];

    this.printer = new PrettyPrint(this);

    // The installed instructions handlers
    const instructions = [];

    // The installed directive handlers
    const directives = {}

    /**
     * @property {xword} pc The program counter for the current section
     * @property {SymbolTable} symbols The assembler symbol table
     */
    Object.defineProperties(this, {
        'pc': {get: function() {return section.pc}},
        'pass': {get: function() {return pass}},
        'symbols': {value: new SymbolTable(this)}
    });

    const init = () => {
        // Install the instruction processors
        instructions.push(new MOV(this))
        instructions.push(new RET(this))
        instructions.push(new NOP(this))
        instructions.push(new ADD_SUB(this))
        instructions.push(new ADC_SBC(this))
        instructions.push(new B(this))
        instructions.push(new AND_ORR_EOR(this))
        instructions.push(new ORN_BIC_EON(this))
        instructions.push(new TST(this))
        instructions.push(new CMP_CMN(this))
        instructions.push(new MRS_MSR(this))
        instructions.push(new LSR_LSL_ASR_ROR(this))
        instructions.push(new SBFM_UBFM(this))
        instructions.push(new LDP_STP(this))

        // Install the assembler directive processors
        installDirective(new GLOBAL(this))
        installDirective(new TEXT(this))
        installDirective(new DATA(this))
    }

    /**
     * Install a directive processor
     * @param {Directive} directive Directive processor
     */
    const installDirective = (directive) => {
        directives[directive.name] = directive
    }

    /**
     * Assemble a source module
     * @param {string} source Assembly source
     */
    this.assemble = (source) => {
        this.errors = [];

        const lex = new Lexer();
        lex.scan(source);

        this.symbols.clear();

        const tokens = lex.tokens;

        for(pass=1; pass<=2;  pass++) {

            // Reset the pass
            // It is easiest to just create a new
            // ELF object for each pass rather than
            // trying to reset it.
            this.obj = new ElfObj();

            section = this.obj.getSection('text');
            let position = 0;

            while(position < tokens.length) {
                //
                // Collect a single line from the assembler source
                // Find the next EOL end of line token
                //
                let lineTokens = [];
                lineBytes = [];
                let lineAddress = section.pc;

                // What is the line number?
                lineNum = tokens[position].line;

                //
                // Extract a line of tokens
                //
                for(; position < tokens.length; position++) {
                    if(tokens[position].type === Token.EOL) {
                        position++;
                        break;
                    } else {
                        lineTokens.push(tokens[position]);
                    }
                }

                //
                // Process the line of tokens
                //

                // Is there a label?
                if(lineTokens.length > 0 && lineTokens[0].type === Token.LABEL) {
                    const token = lineTokens[0];
                    this.symbols.set(token.value, section.pc,
                        section.name, token.line+1, token.char+1, pass);
                    lineTokens.shift();
                }

                if(lineTokens.length > 0) {
                    // Determine if the line contains an assembler directive
                    let directive = null;
                    for(let token of lineTokens) {
                        if(token.type === Token.DIRECTIVE) {
                            directive = token;
                            break;
                        }
                    }

                    if(directive !== null) {
                        // Handle assembler directives
                        if(directives.hasOwnProperty(directive.value)) {
                            directives[directive.value].process(lineTokens)
                        } else {
                            this.error(directive, 'a800', [directive.value])
                        }
                    } else if(lineTokens[0].type === Token.SYMBOL) {  // Is there an instruction?
                        let processed = false;
                        lineTokens[0].makeValueLowerCase();
                        for(const ins of instructions) {
                            if(ins.try(lineTokens)) {
                                processed = true;
                                break;
                            }
                        }
                    }

                }

                if(pass === 2) {
                    if(this.printer !== null) {
                        this.printer.add(lineNum + 1, lex.lines[lineNum], lineAddress, lineBytes);
                    }
                }

                // If max errors reached, break
                if(this.errors.length >= this.options.maxErrors) {
                    break;
                }
            }

            // If we received errors in a pass,
            // don't continue to the next pass.
            if(this.errors.length > 0) {
                break;
            }
        }

        // Transfer the symbols to the OBJ file.
        this.symbols.toElf(this.obj);
        //console.log(this.printer.output);
    }



    this.addWord = (word) => {
        section.addSourceMapping(lineNum + 1, 4);
        for(let i=0; i<4; i++) {
            const byte = word & 0xff;
            section.add(byte);
            lineBytes.push(byte);
            word >>= 8;
        }
    }

    /**
     * What is the current program counter?
     * @returns {number|*}
     */
    // this.pc = () => {
    //     return section.pc;
    // }

    const legacyDirectives = (line) => {
        switch(line[0].value) {
            case '.text':
                section = this.obj.getSection('text');
                break;

            case '.data':
                section = this.obj.getSection('data');
                break;
        }
    }

    /**
     * Set the current assemlby target section.
     * @param {string} name Name of the section (without the '.')
     */
    this.setSection = (name) => {
        section = this.obj.getSection(name)
    }

    /**
     * Throw an assembly error.
     * @param token Token near where error occurred
     * @param code Error code form the AssemblerError object
     * @param args Optional array of arguments to the error.
     * @returns false
     */
    this.error = (token, code, args) => {
        const err = new AssemblerError(code, token.line + 1, token.char + 1, args);
        return this.errorObj(err);
    }



    /**
     * Throw an assembly error.
     * @param err Error object already created
     * @returns {null}
     */
    this.errorObj = (err) => {
        if(this.errors.length < this.options.maxErrors) {
            this.errors.push(err);

            // If the maximum errors is exceeded, add an maximum errors error
            if(this.errors.length >= this.options.maxErrors) {
                this.errors.push(new AssemblerError("a900", err.line, err.char, [this.maxErrors]));
            }
        }

        return null;
    }

    init();
};

