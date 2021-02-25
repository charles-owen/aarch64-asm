import {Instructions} from "../Instructions";
import {Token} from "../Token";

/**
 * Instruction processor: B
 * @param {Assembler} assembler
 * @constructor
 */
export const B = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        const op = line[0].value;
        switch(op) {
            case 'b':
                branch(line, 0x14000000);
                return true;

            case 'bl':
                branch(line, 0x94000000);
                return true;
        }

        if(op.length === 3 && op[0] === 'b') {
            const cond = this.cond(op.substring(1, 3));
            if(cond === null) {
                return false;
            }

            bcond(line, cond);
            return true;
        } else if(op.length === 4 && op[0] === 'b' && op[1] === '.') {
            const cond = this.cond(op.substring(2, 4));
            if(cond === null) {
                return false;
            }

            bcond(line, cond);
            return true;
        }


        // if(line[0].is(Token.SYMBOL, 'ret')) {
        //
        //     if(line.length === 1) {
        //         this.addWord(0xd65f03c0);
        //     } else {
        //         const Rn = this.registerParseLegacy(line[1], 'x', false, false);
        //         if(Rn === null) {
        //             return;
        //         }
        //
        //         const opcode = 0xd65f0000 | (Rn.code << 5);
        //         this.addWord(opcode);
        //     }
        //
        //     return true;
        // }

        return false;
    }

    // TODO: Support for b and bl to global symbols

    const branch = (line, opcode) => {
        if(line.length < 2) {
            return this.error(line[0], 'a127');
        }

        if(line[1].type !== Token.SYMBOL) {
            return this.error(line[1], 'a127');
        }
        let address = assembler.pc;
        if(assembler.pass === 2) {
            const symbol = assembler.symbols.get(line[1].value);
            if(symbol === null) {
                return this.error(line[1], 'a200', [line[1].value])
            }

            address = symbol.value - address;
        }

        this.addWord(opcode | ((address >> 2) & 0x3ffffff));
    }

    const bcond = (line, cond) => {
        if(line.length < 2) {
            return this.error(line[0], 'a127');
        }

        if(line[1].type !== Token.SYMBOL) {
            return this.error(line[1], 'a127');
        }
        let address = assembler.pc;
        if(assembler.pass === 2) {
            const symbol = assembler.symbols.get(line[1].value);
            if(symbol === null) {
                return this.error(line[1], 'a200', [line[1].value])
            }

            address = symbol.value - address;
        }

        this.addWord(0x54000000 |
            (((address >> 2) & 0x7ffff) << 5) |
            cond);
    }
}

B.prototype = Object.create(Instructions.prototype);
B.prototype.constructor = B;