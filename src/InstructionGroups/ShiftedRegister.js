/**
 * ShiftedRegister instruction group
 * @param {Instructions} instruction Instructions object
 * @param {number} opc Default instruction opc
 * @param {number} op2 Default instruction op2
 * @param {boolean} N Default instruction N
 * @constructor
 */
export const ShiftedRegister = function(instruction, opc, op2, N) {

    Object.defineProperties(this, {
        'opc': {
            get: () => { return opc },
            set: (value) => { opc = value }
        }
    })

    //
    // Shifted register
    //

    const shifted_register = (sf, results, token) => {
        let imm6 = results.amt !== undefined ? results.amt : 0;
        let shift = results.shift !== undefined ? results.shift : 0;

        if(sf) {
            if(imm6 < 0 || imm6 > 63) {
                imm6 = 0;
                instruction.error(tokens[9], 'a110');
            }
        } else {
            if(imm6 < 0 || imm6 > 31) {
                imm6 = 0;
                instruction.error(tokens[9], 'a111');
            }
        }
        let shift4 = results.shift4 !== undefined ? results.shift4 : 0

        instruction.addWord(0x0a000000 |
            (sf ? 0x80000000 : 0) |
            (opc << 29) |
            (op2 ? (1 << 24) : 0) |
            (N ? (1 << 21) : 0) |
            (shift4 << 22) |
            (results.Rm << 16) |
            (imm6 << 10) |
            (results.Rn << 5) |
            results.Rd)
    }

    instruction.parser.pattern('<Xd>, <Xn>, <Xm>(, <shift4> #<amt>)', (results, tokens)=> {
        shifted_register(true, results, tokens);
    })

    instruction.parser.pattern('<Wd>, <Wn>, <Wm>(, <shift4> #<amt>)', (results, tokens)=> {
        shifted_register(false, results, tokens);
    })

}