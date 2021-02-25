import {Instructions} from "../Instructions";
import {Token} from "../Token";
import {xword} from "aarch64-util/src/xword";
import {Bitmask} from "aarch64-util/src/Bitmask";

export const AND_ORR_EOR = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Converts instruction into code.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        switch(line[0].value) {
            case 'orr':
                process(line, 0b01, false)
                break;

            case 'and':
                process(line, 0b00, false)
                break;

            case 'ands':
                process(line, 0b11, false)
                break;

            case 'eor':
                process(line, 0b10, false);
                break;

            default:
                return false;
        }

        return true;
    }

    const process = (line, opc, N) => {
        const instruction = line[0].value;
        const templateImmediate = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL, Token.COMMA, Token.IMMEDIATE, Token.NUMBER];
        let imm = this.validateLine(line, templateImmediate);
        if(imm === null) {
            return immediate(line, opc);
        }

        this.shiftedRegister(line, opc, false, N);
    }

    /**
     * Immediate
     * @param line
     * @param opc
     * @returns {*}
     */
    const immediate = (line, opc) => {
        if(line[0].value === 'orn') {
            return this.error(line[0], 'a129');
        }

        // Stack pointer is allowed for Rd for all except ands
        const sp = line[0].value !== 'ands';

        const Rd = this.registerParseLegacy(line[1], '', !sp, sp);
        if(Rd === null) {return}
        const Rn = this.registerParseLegacy(line[3], Rd.variant, true, false);
        if(Rn === null) {return}

        const xw = new xword(line[6].match);
        const bitmask = Bitmask.encode(xw, Rd.variant === 'w');
        if(bitmask === null) {
            return this.error(line[6], "a128");
        }

        const word = (0x12000000 |
            (Rd.variant === 'x' ? 0x80000000 : 0x00000000) |
            (opc << 29) |
            (bitmask.N ? 0x400000 : 0) |
            (bitmask.immr << 16) |
            (bitmask.imms << 10) |
            (Rn.code << 5) |
            Rd.code)

        this.addWord(word);
    }

}


AND_ORR_EOR.prototype = Object.create(Instructions.prototype);
AND_ORR_EOR.prototype.constructor = AND_ORR_EOR;