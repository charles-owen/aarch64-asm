import {Instructions} from "../Instructions";
import {Token} from "../Token";

export const ADC_SBC = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Converts instruction into code.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
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

            default:
                return false;
        }

        return true;
    }


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
            return this.error(line[0], "a002")
        }

        const Rd = this.registerParseLegacy(line[1], null, true, false);
        if(Rd === null) {
            return this.error(line[0], "a010")
        }

        const variant = Rd.variant;
        if(variant === 'x') {
            opcode |= 0x80000000;
        }

        const Rn = this.registerParseLegacy(line[3], variant, true, false);
        const Rm = this.registerParseLegacy(line[5], variant, true, false);
        if(Rn === null || Rm === null) {
            return this.error(line[0], "a010")
        }

        opcode |= Rd.code | (Rn.code << 5) | (Rm.code << 16);
        this.addWord(opcode);
    }

}

ADC_SBC.prototype = Object.create(Instructions.prototype);
ADC_SBC.prototype.constructor = ADC_SBC;