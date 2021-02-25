import {Instructions} from "../Instructions";
import {Token} from "../Token";
import {xword} from "aarch64-util/src/xword";
import {Bitmask} from "aarch64-util/src/Bitmask";

export const CMP_CMN = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        if(line[0].type === Token.SYMBOL) {
            switch(line[0].value) {
                case 'cmp':
                    cmp(line, 1);
                    break;

                case 'cmn':
                    cmp(line, 0);
                    break;

                default:
                    return false;
            }

            return true;
        }

        return false;
    }

    const cmp = (line, op) => {
        // The possible variations are:
        // immediate:
        // cmp <Wn,WSP>, #<imm12>(, <shift>)
        // cmp <Xn,XSP>, #<imm12>(, <shift>)
        // shifted register:
        // opcode <Wn>, <Wm>(, <shift> #<amt32>)
        // opcode <Xn>, <Xm>(, <shift> #<amt64>)
        // extended register
        // opcode <Wn|WSP>, <Wm>, <extend32> (#<shift>)
        // opcode <Xn|SP>, <Rm>, <extend64> (#<shift>)

        // Immediate?
        // cmp <Wn,WSP>, #<imm12>(, <shift>)
        // cmp <Xn,XSP>, #<imm12>(, <shift>)
        const templateImmediate1 = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.IMMEDIATE, Token.NUMBER]
        const templateImmediate2 = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.IMMEDIATE, Token.NUMBER,
            Token.COMMA, Token.SYMBOL, Token.IMMEDIATE, Token.NUMBER];
        let match = this.validateLine(line, templateImmediate1);
        if(match === null) {
            return immediate(line, op,false);
        }

        const match1 = match;

        match = this.validateLine(line, templateImmediate2);
        if(match === null) {
            return immediate(line, op, true);
        }

        // Shifted register?
        // opcode <Wn>, <Wm>(, <shift> #<amt32>)
        // opcode <Xn>, <Xm>(, <shift> #<amt64>)
        const templateSR1 = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL]
        const templateSR2 = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL,
            Token.COMMA, Token.SYMBOL, Token.IMMEDIATE, Token.NUMBER];
        match = this.validateLine(line, templateSR1);
        if(match === null) {
            return shiftedRegister(line, op, false);
        }

        match = this.validateLine(line, templateSR2);
        if(match === null) {
            return shiftedRegister(line, op, true);
        }

        // extended register
        // opcode <Wn|WSP>, <Wm>, <extend32> (#<shift>)
        // opcode <Xn|SP>, <Rm>, <extend64> (#<shift>)
        const templateXR1 = [Token.SYMBOL, Token.SYMBOL, Token.COMMA, Token.SYMBOL, Token.COMMA, Token.SYMBOL]
        match = this.validateLine(line, templateXR1);
        if(match === null) {
            return extendedRegister(line, op, false);
        }

        return this.errorObj(match1);
    }


    const shifter = (code) => {
        code = code.toLowerCase();
        switch(code) {
            case 'lsl':
                return 0;

            case 'lsr':
                return 1;

            case 'asr':
                return 2;
        }

        return null;
    }

    const extender = (code, variant) => {
        code = code.toLowerCase();

        const codes = {'uxtb': 0, 'uxth': 1, 'uxtw': 2, 'uxtx': 3,
            'sxtb': 4, 'sxth': 5, 'sxtw': 6, 'sxtx': 7}

        if(codes.hasOwnProperty(code)) {
            return codes[code];
        }

        // Note currently supporting lsl for this
        // instruction, since it is hard to tell
        // from the shifted register variation...
        // if(code === 'lsl') {
        //     return variant === 'x' ? 3 : 2;
        // }

        return null;
    };


    /**
     * Immediate
     * @param line
     * @param op
     * @param hasShift
     * @returns {*}
     */
    const immediate = (line, op, hasShift) => {
        const Rn = this.registerParseLegacy(line[1], '', true, false);
        if(Rn === null) {return}

        let imm12 = line[4].value;

        // A CMP with a negative immediate value is the
        // same thing as a CMN with the same positive value.
        if(imm12 < 0) {
            imm12 = -imm12;
            op = 1 - op;
        }

        if(imm12 > 0xfff) {
            return this.error(line[4], 'a102')
        }

        let sh = 0;
        if(hasShift) {
            if(line[6].value.toLowerCase() !== 'lsl') {
                return this.error(line[6], 'a103')
            }
            const shift = line[8].value;
            if(shift !== 0 && shift !== 12) {
                return this.error(line[6], 'a103')
            }

            sh = shift / 12;
        }

        const word = (0x3100001f |
            (op << 30) |
            (Rn.variant === 'x' ? 0x80000000 : 0x00000000) |
            (sh << 22) |
            (imm12 << 10) |
            (Rn.code << 5))

        this.addWord(word);
    }

    const shiftedRegister = (line, op, hasShift) => {
        const Rn = this.registerParseLegacy(line[1], '', true, false);
        if(Rn === null) {return}
        const Rm = this.registerParseLegacy(line[3], Rn.variant, true, false);
        if(Rm === null) {return}

        let imm6 = 0;
        let shift = 0;
        if(hasShift) {
            shift = shifter(line[5].value);
            if(shift === null) {
                return this.error(line[7], 'a109');
            }

            imm6 = line[7].value;
            if(Rn.variant === 'x') {
                if(imm6 < 0 || imm6 > 63) {
                    return this.error(line[7], 'a110');
                }
            } else {
                if(imm6 < 0 || imm6 > 31) {
                    return this.error(line[7], 'a111');
                }
            }
        }

        const opcode = 0x2b00001f  |
            (Rn.variant === 'x' ? 0x80000000 : 0) |
            (op << 30) |
            (Rn.code << 5) |
            (Rm.code << 16) |
            (imm6 << 10) |
            (shift << 22);

        this.addWord(opcode);
    }

    const extendedRegister = (line, op, hasShift) => {
        const Rn = this.registerParseLegacy(line[1], '', false, true);
        if(Rn === null) {return}
        const variant = Rn.variant;
        const Rm = this.registerParseLegacy(line[3], '', true, false);
        if(Rm === null) {return}

        const option = extender(line[5].value, variant);

        if(variant === 'w') {
            if(Rm.variant === 'x') {
                return this.error(line[3], 'a004');
            }

        } else {
            if(Rm.variant === 'x' && (option !== 3 && option !== 7)) {
                return this.error(line[5], 'a105');
            }

            if(Rm.variant === 'w' && (option === 3 || option === 7)) {
                return this.error(line[5], 'a105');
            }
        }

        let imm3 = 0;
        if(hasShift) {
            imm3 = line[7].value;
            if(imm3 < 0 || imm3 > 4) {
                return this.error(line[7], 'a106');
            }
        }

        const opcode = 0x2b20001f  |
            (variant === 'x' ? 0x80000000 : 0) |
            (op << 30) |
            (Rn.code << 5) |
            (Rm.code << 16) |
            (option << 13) |
            (imm3 << 10);

        this.addWord(opcode);

    }
}

CMP_CMN.prototype = Object.create(Instructions.prototype);
CMP_CMN.prototype.constructor = CMP_CMN;