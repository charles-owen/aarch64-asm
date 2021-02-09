import {Instructions} from "../Instructions";
import {Token} from "../Token";

export const RET = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        if(line[0].is(Token.SYMBOL, 'ret')) {

            if(line.length === 1) {
                this.addWord(0xd65f03c0);
            } else {
                const Rn = this.registerParse(line[1], 'x', false, false);
                if(Rn === null) {
                    return;
                }

                const opcode = 0xd65f0000 | (Rn.code << 5);
                this.addWord(opcode);
            }

            return true;
        }

        return false;
    }
}

RET.prototype = Object.create(Instructions.prototype);
RET.prototype.constructor = RET;