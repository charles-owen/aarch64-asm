import {Instructions} from "../Instructions";
import {Token} from "../Token";
import {ShiftedRegister} from "../InstructionGroups/ShiftedRegister"

export const ADD_SUB = function(assembler) {
    Instructions.call(this, assembler);

    let opc = 0;
    let op2 = 1;
    let N = false;

    const save = (msg, results) => {
        console.log(msg);
        console.log(results);
    }

    //
    // Immediate mode
    //

    const immediate = (sf, results, tokens) => {
        let useOPC = opc;
        let imm12 = results.imm12 !== undefined ? results.imm12 : 0;
        let amt = results.amt !== undefined ? results.amt : 0;
        if(amt !== 12 && amt !== 0) {
            this.error(tokens[10], 'a103')
            amt = 0;
        }

        // Handle negative immediate value
        if(imm12 < 0) {
            useOPC = opc ^ 0b10;
            imm12 = -imm12;
        }

        if(imm12 > 4095) {
            this.error(tokens[6], 'a102')
            imm12 = 0;
        }

        const opcode = 0x11000000  |
            (sf ? 0x80000000 : 0) |
            (useOPC << 29) |
            (amt/12 << 22) |
            results.Rd |
            (results.Rn << 5) |
            (imm12 << 10);

        this.addWord(opcode);
    }

    this.parser.pattern('<Xd|SP>, <Xn|SP>, #<imm12>(, <shift:lsl> #<amt>)', (results, tokens)=> {
        immediate(true, results, tokens);
    })

    this.parser.pattern('<Wd|WSP>, <Wn|WSP>, #<imm12>(, <shift:lsl> #<amt>)', (results, tokens)=> {
        immediate(false, results, tokens);
    })

    //
    // Shifted register
    //
    const shiftedRegister = new ShiftedRegister(this, opc, op2, N);

    // const shifted_register = (sf, results, token) => {
    //     let imm6 = results.amt !== undefined ? results.amt : 0;
    //     let shift = results.shift !== undefined ? results.shift : 0;
    //
    //     if(sf) {
    //         if(imm6 < 0 || imm6 > 63) {
    //             imm6 = 0;
    //             this.error(tokens[9], 'a110');
    //         }
    //     } else {
    //         if(imm6 < 0 || imm6 > 31) {
    //             imm6 = 0;
    //             this.error(tokens[9], 'a111');
    //         }
    //     }
    //     let shift4 = results.shift4 !== undefined ? results.shift4 : 0
    //
    //     this.addWord(0x0a000000 |
    //         (sf ? 0x80000000 : 0) |
    //         (opc << 29) |
    //         (op2 ? (1 << 24) : 0) |
    //         (N ? (1 << 21) : 0) |
    //         (shift4 << 22) |
    //         (results.Rm << 16) |
    //         (imm6 << 10) |
    //         (results.Rn << 5) |
    //         results.Rd)
    // }
    //
    // this.parser.pattern('<Xd>, <Xn>, <Xm>(, <shift4> #<amt>)', (results, tokens)=> {
    //      shifted_register(true, results, tokens);
    // })
    //
    // this.parser.pattern('<Wd>, <Wn>, <Wm>(, <shift4> #<amt>)', (results, tokens)=> {
    //     shifted_register(false, results, tokens);
    // })

    //
    // Extended register
    //

    const extended = (sf, extend, results, tokens) => {
        let imm3 = results.amt !== undefined ? results.amt : 0;
        if(imm3 > 4) {
            this.error(tokens[9], 'a106')
            imm3 = 0;
        }

        const opcode = 0x0b200000  |
            (sf ? 0x80000000 : 0) |
            (opc << 29) |
            results.Rd |
            (results.Rn << 5) |
            (results.Rm << 16) |
            (extend << 13) |
            (imm3 << 10);

        this.addWord(opcode);
    }

    this.parser.pattern('<Xd|SP>, <Xn|SP>, <Rm>, <extend64>(#<amt>)', (results, tokens)=> {
        extended(true, results.extend64, results, tokens);
    })

    this.parser.pattern('<Wd|WSP>, <Wn|WSP>, <Wm>, <extend32>(#<amt>)', (results, tokens)=> {
        extended(false, results.extend32, results, tokens);
    })

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        if(line[0].type === Token.SYMBOL) {
            switch(line[0].value) {
                case 'add':
                    add_sub(line, true, false, 0b00);
                    break;

                case 'adds':
                    add_sub(line, true, true, 0b01);
                    break;

                case 'sub':
                    add_sub(line, false, false, 0b10);
                    break;

                case 'subs':
                    add_sub(line, false, true, 0b11);
                    break;

                default:
                    return false;
            }

            return true;
        }

        return false;
    }

    const add_sub = (line, add, s, _opc) => {
        opc = _opc;
        shiftedRegister.opc = _opc;
        this.parser.parse(line, 1);
    }
}

ADD_SUB.prototype = Object.create(Instructions.prototype);
ADD_SUB.prototype.constructor = ADD_SUB;