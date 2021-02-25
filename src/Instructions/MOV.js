import {Instructions} from "../Instructions";
import {Token} from "../Token";

export const MOV = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        switch(line[0].value) {
            case 'mov':
                mov(line);
                break;

            case 'movk':
                movzkn(line, 0b11);
                break;

            case 'movn':
                movzkn(line, 0b00);
                break;

            case 'movz':
                movzkn(line, 0b10);
                break;

            default:
                return false;
        }

        return true;
    }

    const templateImmediateNoshift = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.IMMEDIATE, Token.NUMBER];
    const templateImmediateShift = [Token.SYMBOL, Token.SYMBOL, Token.COMMA,
        Token.IMMEDIATE, Token.NUMBER, Token.COMMA, Token.SYMBOL, Token.IMMEDIATE, Token.NUMBER];

    const mov = (line) => {
        let noshift = this.validateLine(line, templateImmediateNoshift);
        if(noshift === null) {
            return movzkn(line, 0b10);
        }

        // Must be register to register
        let validate = this.validateLine(line, [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL])
        if(validate !== null) {
            return errorObj(validate);
        }
        // Test for stack pointer variant
        const re = /sp/i;
        if(re.test(line[1].value) ||
            re.test(line[3].value)) {
            mov_sp(line);
            return;
        }

        const Rd = this.registerParseLegacy(line[1], '', true, false);
        if(Rd === null) {return}
        const Rm = this.registerParseLegacy(line[3], '', true, false);
        if(Rm === null) {return}

        const sf = Rd.variant === 'x';
        if(sf) {
            if(Rm.variant !== 'x') {
                return this.error(line[3], 'a014');
            }
        } else {
            if(Rm.variant !== 'w') {
                return this.error(line[3], 'a013');
            }
        }

        this.addWord(0x2a0003e0 |
            (sf ? 0x80000000 : 0) |
            (Rm.code << 16) |
            (Rd.code));
    }

    /**
     * mov to/from SP variant of the mov instruction
     * @param line
     */
    const mov_sp = (line) => {
        const Rd = this.registerParseLegacy(line[1], '', false, true);
        if(Rd === null) {return}
        const Rn = this.registerParseLegacy(line[3], '', false, true);
        if(Rn === null) {return}

        const sf = Rd.variant === 'x';
        if(sf) {
            if(Rn.variant !== 'x') {
                return this.error(line[3], 'a014');
            }
        } else {
            if(Rn.variant !== 'w') {
                return this.error(line[3], 'a013');
            }
        }

        this.addWord(0x11000000 |
            (sf ? 0x80000000 : 0) |
            (Rn.code << 5) |
            (Rd.code));
    }

    const movzkn = (line, opc) => {
        let noshift = this.validateLine(line, templateImmediateNoshift);
        let shift = this.validateLine(line, templateImmediateShift);

        if(shift !== null && noshift !== null) {
            return this.errorObj(shift);
        }

        const Rd = this.registerParseLegacy(line[1], '', true, false);
        const imm16 = line[4].value;
        const sf = Rd.variant === 'x';

        if(imm16 < 0 || imm16 > 65535) {
            return this.error(line[4], 'a124');
        }
        let hw = 0;
        if(shift === null) {
            const sh = line[8].value;
            if(sf && (sh !== 0 && sh !== 16 && sh !== 32 && sh !== 48)) {
                return this.error(line[8], 'a126');
            }

            if(!sf && (sh !== 0 && sh !== 16)) {
                return this.error(line[8], 'a127');
            }

            hw = sh >> 4;
        }

        this.addWord(
            0x12800000 |
            (opc << 29) |
            (sf ? 0x80000000 : 0) |
            (imm16 << 5) |
            (hw << 21) |
            Rd.code
        );

    }
}

MOV.prototype = Object.create(Instructions.prototype);
MOV.prototype.constructor = MOV;