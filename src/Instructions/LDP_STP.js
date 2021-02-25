import {Instructions} from "../Instructions";
import {Token} from "../Token";

export const LDP_STP = function(assembler) {
    Instructions.call(this, assembler);

    let L = 0;

    const stp32 = (opc, op2, results, immToken) => {
        let imm = 0;
        if(results.hasOwnProperty('imm')) {
            imm = results.imm;
            if((imm > 0 && (imm & 0b11) !== 0) || (imm < 0 && ((-imm) & 0b11) !== 0)) {
                this.error(immToken, 'a136')
                imm = 0;
            }

            if(imm < -256 || imm >252) {
                return this.error(immToken, 'a138')
            }

            imm >>= 2;
        }

        stp(opc, op2, imm, results);
    }

    const stp64 = (opc, op2, results, immToken) => {
        let imm = 0;
        if(results.hasOwnProperty('imm')) {
            imm = results.imm;
            if((imm > 0 && (imm & 0b111) !== 0) || (imm < 0 && ((-imm) & 0b111) !== 0)) {
                this.error(immToken, 'a137')
                imm = 0;
            }

            if(imm < -512 || imm >504) {
                return this.error(immToken, 'a139')
            }

            imm >>= 3;
        }

        stp(opc, op2, imm, results);
    }


    const stp = (opc, op2, imm, results) => {
        this.addWord(0x28000000 |
            (opc << 30) |
            (op2 << 23) |
            (L << 22) |
            ((imm & 0b1111111) << 15) |
            (results.Rt2 << 10) |
            (results.Rn << 5) |
            results.Rt1
        )
    }

    this.parser.pattern('<Wt1>, <Wt2>, [<Xn|SP>], #<imm>', (results, tokens)=> {
        stp32(0b00, 0b01, results, tokens[10])
    })

    // post-index
    this.parser.pattern('<Xt1>, <Xt2>, [<Xn|SP>], #<imm>', (results, tokens)=> {
        stp64(0b10, 0b01, results, tokens[10])
    })

    // pre-index
    this.parser.pattern('<Wt1>, <Wt2>, [<Xn|SP>, #<imm>]!', (results, tokens)=> {
        stp32(0b00, 0b11, results, tokens[9])
    })

    // pre-index
    this.parser.pattern('<Xt1>, <Xt2>, [<Xn|SP>, #<imm>]!', (results, tokens)=> {
        stp64(0b10, 0b11, results, tokens[9])
    })

    // signed offset
    this.parser.pattern('<Wt1>, <Wt2>, [<Xn|SP>(, #<imm>)]', (results, tokens)=> {
        stp32(0b00, 0b10, results, tokens[9])
    })

    // signed offset
    this.parser.pattern('<Xt1>, <Xt2>, [<Xn|SP>(, #<imm>)]', (results, tokens)=> {
        stp64(0b10, 0b10, results, tokens[9])
    })

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        switch(line[0].value) {
            case 'stp':
                L = 0;
                this.parser.parse(line, 1);
                return true;

            case 'ldp':
                L = 1;
                this.parser.parse(line, 1);
                return true;
        }

        return false;
    }
}

LDP_STP.prototype = Object.create(Instructions.prototype);
LDP_STP.prototype.constructor = LDP_STP;