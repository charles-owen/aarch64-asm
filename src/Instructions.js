import {Component} from "./Component";
import {Token} from "./Token";
import {AssemblerError} from "./Error";
import {Parser} from "./Parser";

/**
 * Base object for classes of assembly instructions supported by the assembler.
 * @param assembler Assembler object
 * @constructor
 */
export const Instructions = function(assembler) {
    Component.call(this, assembler);


    // All of the ARM condition codes
    this.conds = {
        'eq': 0b0000,
        'ne': 0b0001,
        'ge': 0b1010,
        'lt': 0b1011,
        'gt': 0b1100,
        'le': 0b1101,
        'hi': 0b1000,
        'ls': 0b1001,
        'hs': 0b0010,
        'cs': 0b0010,
        'lo': 0b0011,
        'cc': 0b0011,
        'mi': 0b0100,
        'pl': 0b0101,
        'vs': 0b0110,
        'vc': 0b0111
    }

    Object.defineProperties(this, {
        'parser': {value: new Parser(assembler, this)}
    })

    this.parser.errorHandler = (token, code, args={}) => {
        this.error(token, code, args)
    }

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        return false;
    }

    this.addWord = (word) => {
        assembler.addWord(word);
    }


    /**
     * Parse a provided register value
     * @param token Token the register comes from.
     * @param variant w, x, or null to allow either
     * @param zr True if xzr or wzr registers are allowed
     * @param sp True is sp or wsp are allowed
     * @return {{}} Returns an object with names error,  variant, reg, and code
     */
    this.registerParse = (token, variant, zr, sp) => {
        if(token.type !== Token.SYMBOL) {
            return makeRegisterError(token, 'a003');
        }

        // Get the potential register name
        let str = token.value.toLowerCase();

        // So everything starts with x or w
        if(str === 'sp') {
            str = 'xsp';
        }

        if(str[0] === 'x') {
            if(variant === 'w') {
                return makeRegisterError(token, 'a004');
            }

            if(str === 'xsp') {
                if(!sp) {
                    return makeRegisterError(token, 'a005');
                }

                return {error: null, variant: 'x', reg: 'sp', code: 31};
            }

            if(str === 'xzr') {
                if(!zr) {
                    return makeRegisterError(token, 'a015');
                }

                return {error: null, variant: 'x', reg: 'xzr', code: 31};
            }

            const match = str.match(/^x([0-9][0-9]*)$/);
            if(match === null) {
                // Invalid register name, expected a 64-bit register name
                return makeRegisterError(token, 'a014');
            }

            if(match[1] > 30) {
                // Invalid register number
                return makeRegisterError(token, "a011", [match[1]]);
            }

            return {error: null, variant: 'x', reg: str, code: +match[1]};
        } else if(str[0] === 'w') {
            if(variant === 'x') {
                return makeRegisterError(token, "a007");
            }

            if(str === 'wsp') {
                if(!sp) {
                    return makeRegisterError(token, "a005");
                }

                return {error: null, variant: 'w', reg: 'wsp', code: 31};
            }

            if(str === 'wzr') {
                if(!zr) {
                    return makeRegisterError(token, "a015");
                }

                return {error: null, variant: 'w', reg: 'wzr', code: 31};
            }

            const match = str.match(/^w([0-9][0-9]*)$/);
            if(match === null) {
                // Invalid register name, expected a 32-bit register name
                return makeRegisterError(token, "a013");
            }

            if(match[1] > 30) {
                // Invalid register number
                return makeRegisterError(token, "a011", [match[1]]);
            }

            return {error: null, variant: 'w', reg: str, code: +match[1]};
        }

        switch(variant) {
            case 'x':
                return makeRegisterError(token, 'a014');

            case 'w':
                return makeRegisterError(token, 'a013');
        }

        return makeRegisterError(token, 'a003');
    }

    /**
     * Make an assembler error object for the registerParse function
     * @param {Token} token Token the error is on.
     * @param {array} args Optional
     * @param {string} code The error code
     * @param {boolean} [tokenEnd=false] Error is at end of token if true
     * @returns {{error: AssemblerError}}
     */
    const makeRegisterError = (token, code, args=[], tokenEnd=false) => {
        const char = tokenEnd ? token.char+token.match.length : token.char;
        return {error: new AssemblerError(code, token.line+1, char+1, args)}
    }

    /**
     * Parse a provided register value
     * @param token Token the register comes from.
     * @param variant w, x, or null to allow either
     * @param zr True if xzr or wzr registers are allowed
     * @param sp True is sp or wsp are allowed
     *
     */
    this.registerParseLegacy = (token, variant, zr, sp) => {
        const result = this.registerParse(token, variant, zr, sp)
        if(result.error !== null) {
            this.errorObj(result.error);
            return null;
        }

        return result;
    }



    /**
     * Function to validate a line against a simple template.
     * @param line Array of tokens representing a line
     * @param template Array of token types
     * @returns
     */
    this.validateLine = (line, template) => {
        if(line.length < template.length) {
            const token = line[line.length-1];
            return new AssemblerError('a123', token.line+1, token.char+token.match.length+1,
               [Token.toName(template[line.length]).toLowerCase()]);
        } else if(line.length > template.length) {
            const token = line[template.length];
            return new AssemblerError('a122', token.line+1, token.char+1);
        }

        for(let i=0; i<line.length; i++) {
            if(line[i].type !== template[i]) {
                return new AssemblerError('a123', token.line+1, token.char+token.match.length+1,
                    [Token.toName(template[i]).toLowerCase()]);
            }
        }

        return null;
    }



    /**
     * Assemble a shifted register instruction.
     * @param {array} line Array of line tokens
     * @param opc Bits 30-29 of the instruction
     * @param op2 Bit 24 of the instruction
     * @param N Bit 21 of the instruction
     */
    this.shiftedRegister = (line, opc, op2, N) => {
        const templateNoShift = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL, Token.COMMA, Token.SYMBOL];
        const templateShift = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL, Token.COMMA, Token.SYMBOL,
            Token.COMMA, Token.SYMBOL, Token.IMMEDIATE, Token.NUMBER];
        let tns = this.validateLine(line, templateNoShift);
        let ts = this.validateLine(line, templateShift);
        if(tns !== null && ts !== null) {
            return this.errorObj(tns);
        }

        const Rd = this.registerParseLegacy(line[1], '', true, false);
        if(Rd === null) {return}
        const sf = Rd.variant === 'x';
        const Rn = this.registerParseLegacy(line[3], Rd.variant, true, false);
        if(Rn === null) {return}
        const Rm = this.registerParseLegacy(line[5], Rd.variant, true, false);
        if(Rm === null) {return}

        let shift = 0b00;
        let imm6 = 0;
        if(ts === null) {
            switch(line[7].value.toLowerCase()) {
                case 'lsl':
                    shift = 0b00;
                    break;

                case 'lsr':
                    shift = 0b01;
                    break;

                case 'asr':
                    shift = 0b10;
                    break;

                case 'ror':
                    shift = 0b11;
                    break;

                default:
                    this.error(line[7], 'a130')
                    return;
            }

            imm6 = line[9].value;
            if(imm6 < 0 || imm6 > 0b111111) {
                return this.error(line[9], 'a131', [line[9].value]);
            }
        }

        this.addWord(0x0a000000 |
            (sf ? 0x80000000 : 0) |
            (opc << 29) |
            (op2 ? (1 << 24) : 0) |
            (N ? (1 << 21) : 0) |
            (shift << 22) |
            (Rm.code << 16) |
            (imm6 << 10) |
            (Rn.code << 5) |
            Rd.code)
    }


    this.cond = (symbol) => {
        if(this.conds.hasOwnProperty(symbol)) {
            return this.conds[symbol];
        }

        return null;
    }
}

Instructions.prototype = Object.create(Component.prototype);
Instructions.prototype.constructor = Instructions;