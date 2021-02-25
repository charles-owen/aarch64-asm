import {Instructions} from "../Instructions";
import {Token} from "../Token";

export const SBFM_UBFM = function(assembler) {
    Instructions.call(this, assembler);

    let opc = 0;

    const save = (msg, results) => {
        console.log(msg);
        console.log(results);
    }


    const coding = (sf, results, tokens) => {
        this.addWord(0b00010011000000000000000000000000 |
            (opc << 29) |
            (sf ? 0x80400000 : 0) |
            (results.immr << 16) |
            (results.imms << 10) |
            (results.Rn << 5) |
            results.Rd)
    }

    this.parser.pattern('<Wd>, <Wn>, #<immr:imm32>, #<imms:imm32>', (results, tokens)=> {
        // save('32-bit variant', results);
        coding(false, results, tokens);
    })

    this.parser.pattern('<Xd>, <Xn>, #<immr:imm64>, #<imms:imm64>', (results, tokens)=> {
        // save('64-bit variant', results);
        coding(true, results, tokens)
    })

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        switch(line[0].value) {
            case 'ubfm':
                opc = 0b10;
                this.parser.parse(line, 1);
                return true;

            case 'sbfm':
                opc = 0b00;
                this.parser.parse(line, 1);
                return true;
        }

        return false;
    }
}

SBFM_UBFM.prototype = Object.create(Instructions.prototype);
SBFM_UBFM.prototype.constructor = SBFM_UBFM;