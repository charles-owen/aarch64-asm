import {Instructions} from "../Instructions";
import {Token} from "../Token";

export const NOP = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        if(line[0].is(Token.SYMBOL, 'nop')) {
            this.addWord(0xd503201f);
            return true;
        }

        return false;
    }
}

NOP.prototype = Object.create(Instructions.prototype);
NOP.prototype.constructor = NOP;