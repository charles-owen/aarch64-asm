import {Instructions} from "../Instructions";
import {Token} from "../Token";
import {ADD_SUB} from "./ADD_SUB";

/**
 * Instructions supported:
 * lsr, lsl, asr, ror
 * lsrv, lslv, asrv, rorv
 * @param assembler
 * @constructor
 */
export const LSR_LSL_ASR_ROR = function(assembler) {
    Instructions.call(this, assembler)

    let instruction = '';
    let opc = 0;
    let op2 = 0;

    const save = (msg, results) => {
        console.log(msg);
        console.log(results);
    }

    const register = (results, tokens, sf) => {
        this.addWord(0b00011010110000000010000000000000 |
            (sf ? 0x80000000 : 0) |
            (op2 << 10) |
            (results.Rm << 16) |
            (results.Rn << 5) |
            results.Rd);
    }

    this.parser.pattern('<Wd>, <Wn>, <Wm>', (results, tokens)=> {
        register(results, tokens, false);
    })


    this.parser.pattern('<Xd>, <Xn>, <Xm>', (results, tokens)=> {
        register(results, tokens, true);
    })

    const immediate = (results, tokens, sf, immr, imms) => {
        if(instruction.substr(instruction.length - 1) === 'v') {
            if(sf) {
                return this.error(tokens[5], 'a014')
            } else {
                return this.error(tokens[5], 'a013')
            }
        }

        this.addWord(0b00010011000000000000000000000000 |
            (sf ? 0x80400000 : 0) |
            (opc << 29) |
            (immr << 16) |
            (imms << 10) |
            (results.Rn << 5) |
            results.Rd);
    }


    const ror_immediate = (results, tokens, sf, imms) => {
        this.addWord(0b00010011100000000000000000000000 |
            (sf ? 0x80400000 : 0) |
            (imms << 10) |
            (results.Rn << 16) |
            (results.Rn << 5) |
            results.Rd);
    }

    this.parser.pattern('<Wd>, <Wn>, #<amt>', (results, tokens)=> {
        let imm = results.amt;
        if(imm < 0 || imm > 31) {
            this.error(tokens[6], 'a111')
            imm = 0;
        }

        switch(instruction) {
            case 'lsl':
            case 'lslv':
                const imms = 31 - imm;
                immediate(results, tokens, false, (imms+1) & 0b11111, imms);
                break;

            case 'ror':
                ror_immediate(results, tokens, false, imm);
                break;

            default:
                immediate(results, tokens, false, imm, 0b011111);
                break;
        }

    })


    this.parser.pattern('<Xd>, <Xn>, #<amt>', (results, tokens)=> {
        let imm = results.amt;
        if(imm < 0 || imm > 63) {
            this.error(tokens[6], 'a110')
            imm = 0;
        }

        switch(instruction) {
            case 'lsl':
            case 'lslv':
                const imms = 63 - imm;
                immediate(results, tokens, true, imms+1, imms);
                break;

            case 'ror':
                ror_immediate(results, tokens, true, imm);
                break;

            default:
                immediate(results, tokens, true, imm, 0b111111);
                break;
        }


    })

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        if(line[0].type === Token.SYMBOL) {
            instruction = line[0].value;
            switch(line[0].value) {
                case 'lsr':
                case 'lsrv':
                    lsr_family(line, 0b10, 0b01);
                    break;

                case 'lsl':
                case 'lslv':
                    lsr_family(line, 0b10, 0b00);
                    break

                case 'asr':
                case 'asrv':
                    lsr_family(line, 0b00, 0b10);
                    break;

                case 'ror':
                case 'rorv':
                    lsr_family(line, 0b00, 0b11)
                    break;

                default:
                    return false;
            }

            return true;
        }

        return false;
    }

    const lsr_family = (line, opc_, op2_) => {
        opc = opc_;
        op2 = op2_;
        this.parser.parse(line, 1);
    }
}

LSR_LSL_ASR_ROR.prototype = Object.create(Instructions.prototype);
LSR_LSL_ASR_ROR.prototype.constructor = LSR_LSL_ASR_ROR;