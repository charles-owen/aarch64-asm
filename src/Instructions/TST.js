import {Instructions} from "../Instructions";
import {Token} from "../Token";
import {ADC_SBC} from "./ADC_SBC";
import {xword} from "aarch64-util/src/xword";
import {Bitmask} from "aarch64-util/src/Bitmask";

export const TST = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Converts instruction into code.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        switch(line[0].value) {
            case 'tst':
                process(line, 0b11)
                break;

            default:
                return false;
        }

        return true;
    }

    const process = (line, opc, sp) => {

        const templateImmediate = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.IMMEDIATE, Token.NUMBER];
        let imm = this.validateLine(line, templateImmediate);
        if(imm === null) {
            return immediate(line, opc);
        }

        //
        // Shifted Register
        //

        const templateNoShift = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL];
        const templateShift = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL,
            Token.COMMA, Token.SYMBOL, Token.IMMEDIATE, Token.NUMBER];
        let tns = this.validateLine(line, templateNoShift);
        let ts = this.validateLine(line, templateShift);
        if(tns !== null && ts !== null) {
            return this.errorObj(tns);
        }

        const Rn = this.registerParseLegacy(line[1], '', true, false);
        if(Rn === null) {return}
        const sf = Rn.variant === 'x';
        const Rm = this.registerParseLegacy(line[3], Rn.variant, true, false);
        if(Rm === null) {return}

        const N = 0;

        let shift = 0b00;
        let imm6 = 0;
        if(ts === null) {
            switch(line[5].value.toLowerCase()) {
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
                    this.error(line[5], 'a130')
                    return;
            }

            imm6 = line[7].value;
            if(imm6 < 0 || imm6 > 0b111111) {
                return this.error(line[9], 'a131', [line[9].value]);
            }
        }

        this.addWord(0x0a00001f |
            (sf ? 0x80000000 : 0) |
            (opc << 29) |
            (N ? (1 << 21) : 0) |
            (Rm.code << 16) |
            (imm6 << 10) |
            (Rn.code << 5))
    }

    /**
     * Immediate
     * @param line
     * @param opc
     * @returns {*}
     */
    const immediate = (line, opc) => {
        const Rn = this.registerParseLegacy(line[1], '', true, false);
        if(Rn === null) {return}

        const xw = new xword(line[4].match);
        const bitmask = Bitmask.encode(xw, Rn.variant === 'w');
        if(bitmask === null) {
            return this.error(line[4], "a128");
        }

        const word = (0x1200001f |
            (Rn.variant === 'x' ? 0x80000000 : 0x00000000) |
            (opc << 29) |
            (bitmask.N ? 0x400000 : 0) |
            (bitmask.immr << 16) |
            (bitmask.imms << 10) |
            (Rn.code << 5))

        this.addWord(word);
    }

}


ADC_SBC.prototype = Object.create(Instructions.prototype);
ADC_SBC.prototype.constructor = ADC_SBC;