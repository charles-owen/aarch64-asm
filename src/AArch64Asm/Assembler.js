import {Options} from './Options';
import {Lexer} from './Lexer';
import {Token} from './Token';
import {PrettyPrint} from './PrettyPrint';
import {ElfObj} from '../Elf/ElfObj';
import {SymbolTable} from "./SymbolTable";
import {AssemblerError} from "./Error";

import {RET} from "./Instructions/RET";
import {NOP} from "./Instructions/NOP";

/**
 * Constructor
 * @param options
 * @constructor
 */
export const Assembler = function(options) {
    // The Options object that manages user options
    this.options = new Options(options);

    // The symbol table
    let symbols = null;

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
    let instructions = [];

    const init = () => {
        // Install the instruction processors
        instructions.push(new RET(this));
        instructions.push(new NOP(this));
    }

    this.assemble = (source) => {
        this.errors = [];

        const lex = new Lexer();
        lex.scan(source);

        symbols = new SymbolTable();

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
                let line = [];
                lineBytes = [];
                let lineAddress = section.pc;

                // What is the line number?
                lineNum = tokens[position].line;

                for(; position < tokens.length; position++) {
                    if(tokens[position].type === Token.EOL) {
                        position++;
                        break;
                    } else {
                        line.push(tokens[position]);
                    }
                }

                //
                // Process the line
                //

                // Is there a label?
                if(line.length > 0 && line[0].type === Token.LABEL) {
                    const token = line[0];
                    symbols.set(token.value, section.pc, section.name, token.line+1, token.char+1);
                    line.shift();
                }

                if(line.length > 0) {
                    // Is this an assembler directive?
                    if(line[0].type === Token.DIRECTIVE) {      // Assembler directive?
                        directives(line);
                    } else if(line[0].type === Token.SYMBOL) {  // Is there an instruction?
                        let processed = false;
                        for(const ins of instructions) {
                            if(ins.try(line)) {
                                processed = true;
                                break;
                            }
                        }

                        if(!processed) {
                            // Eventually replaced with plug-in instruction handling
                            instruction(line);
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
        symbols.toElf(this.obj);
        //console.log(this.printer.output);
    }

    /**
     * Assemble a line into instructions
     * @param line Array of tokens that make up the line
     */
    const instruction = (line) => {
        switch(line[0].value) {
            case 'adc':
                simple3(line, 0x1a000000);
                break;

            case 'adcs':
                simple3(line, 0x3a000000);
                break;

            case 'sbc':
                simple3(line, 0x5a000000);
                break;

            case 'sbcs':
                simple3(line, 0x7a000000);
                break;

            case 'add':
                add_sub(line, true, false);
                break;

            case 'adds':
                add_sub(line, true, true);
                break;

            case 'sub':
                add_sub(line, false, false);
                break;

            case 'subs':
                add_sub(line, false, true);
                break;
        }
    }

    const add_sub = (line, add, s) => {
        // The possible variations are:
        // immediate:
        // opcode <Wd|WSP>, <Wn,WSP>, #<imm12>(, <shift>)
        // opcode <Wd|WSP>, <Wn,WSP>, #<imm12>(, <shift>)
        // shifted register:
        // opcode <Wd>, <Wn>, <Wm>(, <shift> #<amt32>)
        // opcode <Xd>, <Xn>, <Xm>(, <shift> #<amt64>)
        // extended register
        // opcode <Wd|WSP>, <Wn|WSP>, <Wm>, <extend32> (#<shift>)
        // opcode <Xd|SP>, <Xn|SP>, <Rm>, <extend64> (#<shift>)
        if(line.length < 6) {
            return error(line[0], "a100");
        }

        if(line[2].type !== Token.COMMA || line[4].type !== Token.COMMA) {
            return error(line[0], "a002")
        }

        // Destination and first source register must be registers
        const Rd = registerParse(line[1], true, true);
        const Rn = registerParse(line[3], true, true);
        if(Rd === null || Rn === null) {
            return;
        }

        const variant = Rd.variant;
        if(Rn.variant !== variant) {
            if(variant === 'x') {
                return error(line[1], 'a007');
            } else {
                return error(line[1], 'a004');
            }
        }

        // Could this be immediate?
        if(line[5].type === Token.IMMEDIATE) {
            //
            // Immediate variation
            //
            if(Rd.reg === 'xzr' || Rd.reg === 'wzr') {
                return error(line[1], 'a015');
            }

            if(Rn.reg === 'xzr' || Rn.reg === 'wzr') {
                return error(line[3], 'a015');
            }

            if(line.length < 7 || line[6].type !== Token.NUMBER) {
                return error(line[5], 'a101');
            }

            let imm12 = line[6].value;
            if(imm12 < 0) {
                add = !add;
                imm12 = -imm12;
            }

            if(imm12 >= 4096) {
                return error(line[6], "a102");
            }

            let sh = 0;

            if(line.length > 7) {
                // Shift provided
                // opcode <Wd|WSP>, <Wn,WSP>, #<imm12>, lsl #12
                if(line.length < 11) {
                    return error(line[7], "a103");
                }

                if(line[7].type !== Token.COMMA) {
                    return error(line[7], "a104");
                }

                if(line[8].type !== Token.SYMBOL || line[8].value.toLowerCase() !== 'lsl' ||
                    line[9].type !== Token.IMMEDIATE || line[10].type !== Token.NUMBER) {
                    return error(line[7], "a103");
                }

                const shift = line[10].value;
                if(shift === 0) {
                    // We are fine
                } else if(shift === 12) {
                    sh = 1;
                } else {
                    return error(line[7], "a103");
                }
            }

            const opcode = 0x11000000  |
                (variant === 'x' ? 0x80000000 : 0) |
                (s   ? 0x20000000 : 0) |
                (add ? 0 : 0x40000000) |
                (sh << 22) |
                Rd.code |
                (Rn.code << 5) |
                (imm12 << 10);

            addWord(opcode);
            return;
        }

        // Is this extended register mode?
        // add<s> <Wd|WSP>, <Wn|WSP>, <Wm>, <extend32> (#<shift>)
        if(line.length > 7 && line[7].type === Token.SYMBOL && extender(line[7].value, '') !== null) {
            //
            // extended register mode
            //
            if(Rd.reg === 'xzr' || Rd.reg === 'wzr') {
                return error(line[1], 'a015');
            }

            if(Rn.reg === 'xzr' || Rn.reg === 'wzr') {
                return error(line[3], 'a015');
            }

            const option = extender(line[7].value, variant);

            const Rm = registerParse(line[5], '', true, false);
            if(Rm === null) {
                return;
            }

            if(variant === 'w') {
                if(Rm.variant === 'x') {
                    return error(line[5], 'a004');
                }

            } else {
                if(Rm.variant === 'x' && (option !== 3 && option !== 7)) {
                    return error(line[7], 'a105');
                }

                if(Rm.variant === 'w' && (option === 3 || option === 7)) {
                    return error(line[7], 'a105');
                }
            }

            let imm3 = 0;

            // add<s> <Wd|WSP>, <Wn|WSP>, <Wm>, <extend32> (#<shift>)
            if(line.length > 8) {
                if(line[8].type !== Token.IMMEDIATE || line.length < 10||
                    line[9].type !== Token.NUMBER) {
                    return error(line[8], 'a106');
                }

                imm3 = line[9].value;
                if(imm3 < 0 || imm3 > 4) {
                    return error(line[7], 'a106');
                }
            }

            const opcode = 0x0b200000  |
                (variant === 'x' ? 0x80000000 : 0) |
                (s   ? 0x20000000 : 0) |
                (add ? 0 : 0x40000000) |
                Rd.code |
                (Rn.code << 5) |
                (Rm.code << 16) |
                (option << 13) |
                (imm3 << 10);

            addWord(opcode);
            return;
        }

        //
        // Must be shifted register!
        //

        if(Rd.reg === 'sp' || Rd.reg === 'wsp') {
            return error(line[1], 'a107');
        }

        if(Rn.reg === 'sp' || Rn.reg === 'wsp') {
            return error(line[3], 'a107');
        }

        const Rm = registerParse(line[5], variant, true, false);
        if(Rm === null) {
            return;
        }

        let imm6 = 0;
        let shift = 0;

        // add<s> <Wd|WSP>, <Wn|WSP>, <Wm>, <shift> (#<amount>)
        if(line.length > 6) {
            if(line.length < 10 ||
                line[6].type !== Token.COMMA ||
                line[7].type !== Token.SYMBOL ||
                line[8].type !== Token.IMMEDIATE ||
                line[9].type !== Token.NUMBER) {
                return error(line[6], 'a108');
            }

            shift = shifter(line[7].value);
            if(shift === null) {
                return error(line[7], 'a109');
            }


            imm6 = line[9].value;
            if(variant === 'x') {
                if(imm6 < 0 || imm6 > 63) {
                    return error(line[9], 'a110');
                }
            } else {
                if(imm6 < 0 || imm6 > 31) {
                    return error(line[9], 'a111');
                }
            }

        }

        const opcode = 0x0b000000  |
                (variant === 'x' ? 0x80000000 : 0) |
                (s   ? 0x20000000 : 0) |
                (add ? 0 : 0x40000000) |
                Rd.code |
                (Rn.code << 5) |
                (Rm.code << 16) |
                (imm6 << 10) |
                (shift << 22);

        addWord(opcode);
    }


    const shifter = (code) => {
        code = code.toLowerCase();
        switch(code) {
            case 'lsl':
                return 0;

            case 'lsr':
                return 1;

            case 'asr':
                return 2;
        }

        return null;
    }

    const extender = (code, variant) => {
        code = code.toLowerCase();

        const codes = {'uxtb': 0, 'uxth': 1, 'uxtw': 2, 'uxtx': 3,
            'sxtb': 4, 'sxth': 5, 'sxtw': 6, 'sxtx': 7}

        if(codes.hasOwnProperty(code)) {
            return codes[code];
        }

        // Note currently supporting lsl for this
        // instruction, since it is hard to tell
        // from the shifted register variation...
        // if(code === 'lsl') {
        //     return variant === 'x' ? 3 : 2;
        // }

        return null;
    };

    /**
     * Simple instructions with only:
     * <Wd>, <Wn>, <Wm> (or)
     * <Xd>, <Xn>, <Xm>
     * @param line Tokens for the line
     * @param opcode Opcode to add the registers to
     */
    const simple3 = (line, opcode) => {
        if(line.length < 6) {
            error(line[0], "a001");
            return;
        }

        // for(let token of line) {
        //     console.log(token);
        // }

        if(line[2].type !== Token.COMMA || line[4].type !== Token.COMMA) {
            return error(line[0], "a002")
        }

        const Rd = registerParse(line[1], null, true, false);
        if(Rd === null) {
            return error(line[0], "a010")
        }

        const variant = Rd.variant;
        if(variant === 'x') {
            opcode |= 0x80000000;
        }

        const Rn = registerParse(line[3], variant, true, false);
        const Rm = registerParse(line[5], variant, true, false);
        if(Rn === null || Rm === null) {
            return error(line[0], "a010")
        }

        opcode |= Rd.code | (Rn.code << 5) | (Rm.code << 16);
        addWord(opcode);
    }


    /**
     * Parse a provided register value
     * @param token Token the register comes from.
     * @param variant w, x, or null to allow either
     * @param zr True if xzr or wzr registers are allowed
     * @param sp True is sp or wsp are allowed
     *
     */
    const registerParse = (token, variant, zr, sp) => {
        if(token.type !== Token.SYMBOL) {
            error(token, "a003");
            return null;
        }

        let str = token.value.toLowerCase();

        // So everything starts with x or w
        if(str === 'sp') {
            str = 'xsp';
        }

        if(str[0] === 'x') {
            if(variant === 'w') {
                error(token, "a004");
                return null;
            }

            if(str === 'xsp') {
                if(!sp) {
                    error(token, "a005", "Syntax error: the stack register is not allowed here");
                    return null;
                }

                return {variant: 'x', reg: 'sp', code: 31};
            }

            if(str === 'xzr') {
                if(!zr) {
                    error(token, "a015");
                    return null;
                }

                return {variant: 'x', reg: 'xzr', code: 31};
            }

            const match = str.match(/^x([0-9][0-9]*)$/);
            if(match === null) {
                error(token, "a006", "Syntax error: invalid register name");
                return null;
            }

            if(match[1] > 31) {
                error(token, "a007", "Syntax error: invalid register number");
                return null;
            }

            return {variant: 'x', reg: str, code: +match[1]};
        } else if(str[0] === 'w') {
            if(variant === 'x') {
                error(token, "a007");
                return null;
            }

            if(str === 'wsp') {
                if(!sp) {
                    error(token, "a005", "Syntax error: the stack register is not allowed here");
                    return null;
                }

                return {variant: 'w', reg: 'wsp', code: 15};
            }

            if(str === 'wzr') {
                if(!zr) {
                    error(token, "a015");
                    return null;
                }

                return {variant: 'w', reg: 'wzr', code: 31};
            }

            const match = str.match(/^w([0-9][0-9]*)$/);
            if(match === null) {
                error(token, "a006", "Syntax error: invalid register name");
                return null;
            }

            if(match[1] > 31) {
                error(token, "a007", "Syntax error: invalid register number");
                return null;
            }

            return {variant: 'w', reg: str, code: +match[1]};
        }

        return null;
    }

    const addWord = (word) => {
        section.addSourceMapping(lineNum + 1);
        for(let i=0; i<4; i++) {
            const byte = word & 0xff;
            section.add(byte);
            lineBytes.push(byte);
            word >>= 8;
        }
    }

    this.addWord = addWord;


    const directives = (line) => {
        switch(line[0].value) {
            case '.text':
                section = this.obj.getSection('text');
                break;

            case '.data':
                section = this.obj.getSection('data');
                break;

            case '.global':
                directive_global(line);
                break;
        }
    }

    /**
     * Process the .global directive
     * @param line Line containing the directive
     */
    const directive_global = (line) => {
        if(pass === 1) {
            // Nothing do in the first pass...
            return;
        }

        const v = validateLine(line, [Token.DIRECTIVE, Token.SYMBOL]);

        if(v === 100) {
            return error(line[0], 'a401');
        } else if(v >= 0) {
            return error(line[0], 'a401');
        }

        // Find the symbol
        const symbol = symbols.get(line[1].value);
        if(symbol === null) {
            return error(line[1], 'a200', [line[1].value]);
        }

        symbol.global = true;
    }

    /**
     * Function to validate a line against a simple template.
     * @param line Array of tokens representing a line
     * @param template Array of token types
     * @returns -1 if match is good. 100 if too short and 101 if too long.
     * Otherwise returns index of first mismatch.
     */
    const validateLine = (line, template) => {
        if(line.length < template.length) {
            return 100;
        } else if(line.length > template.length) {
            return 101;
        }

        for(let i=0; i<line.length; i++) {
            if(line[i].type !== template[i]) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Throw an assembly error.
     * @param token Token near where error occurred
     * @param code Error code form the AssemblerError object
     * @param args Optional array of arguments to the error.
     * @returns {null}
     */
    this.error = (token, code, args) => {
        if(this.errors.length < this.options.maxErrors) {
            const err = new AssemblerError(code, token.line + 1, token.char + 1, args);
            this.errors.push(err);

            // If the maximum errors is exceeded, add an maximum errors error
            if(this.errors.length >= this.options.maxErrors) {
                this.errors.push(new AssemblerError("a900", token.line + 1, token.char + 1, [this.maxErrors]));
            }

            return null;
        }

        return null;
    }

    const error = this.error;

    init();
};

