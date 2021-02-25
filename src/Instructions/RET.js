import {Instructions} from "../Instructions";
import {Token} from "../Token";

export const RET = function(assembler) {
    Instructions.call(this, assembler);

    this.parser.pattern('(<Xn>)', (results)=> {
        if(results.hasOwnProperty('Rn')) {
            const opcode = 0xd65f0000 | (results.Rn << 5);
            this.addWord(opcode);
        } else {
            this.addWord(0xd65f03c0);
        }
    })

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        if(line[0].is(Token.SYMBOL, 'ret')) {
            this.parser.parse(line, 1);
            return true;
        }

        return false;
    }
}

RET.prototype = Object.create(Instructions.prototype);
RET.prototype.constructor = RET;