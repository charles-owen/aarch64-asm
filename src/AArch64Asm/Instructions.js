import {Token} from "./Token";
import {AssemblerError} from "./Error";

/**
 * Base object for classes of assembly instructions supported by the assembler.
 * @param assembler Assembler object
 * @constructor
 */
export const Instructions = function(assembler) {

    /**
     * Replace with version that converts the instruction
     * into code in a derived object.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        return false;
    }

    this.addWord = (word) => {
        assembler.addWord(word);
    }


    /**
     * Parse a provided register value
     * @param token Token the register comes from.
     * @param variant w, x, or null to allow either
     * @param zr True if xzr or wzr registers are allowed
     * @param sp True is sp or wsp are allowed
     *
     */
    this.registerParse = (token, variant, zr, sp) => {
        if(token.type !== Token.SYMBOL) {
            error(token, "a003");
            return null;
        }

        let str = token.value.toLowerCase();

        // So everything starts with x or w
        if(str === 'sp') {
            str = 'xsp';
        }

        if(str[0] === 'x') {
            if(variant === 'w') {
                error(token, "a004");
                return null;
            }

            if(str === 'xsp') {
                if(!sp) {
                    error(token, "a005");
                    return null;
                }

                return {variant: 'x', reg: 'sp', code: 31};
            }

            if(str === 'xzr') {
                if(!zr) {
                    error(token, "a015");
                    return null;
                }

                return {variant: 'x', reg: 'xzr', code: 31};
            }

            const match = str.match(/^x([0-9][0-9]*)$/);
            if(match === null) {
                // Invalid register name, expected a 64-bit register name
                return error(token, "a014");
            }

            if(match[1] > 30) {
                // Invalid register number
                error(token, "a011", [match[1]]);
                return null;
            }

            return {variant: 'x', reg: str, code: +match[1]};
        } else if(str[0] === 'w') {
            if(variant === 'x') {
                error(token, "a007");
                return null;
            }

            if(str === 'wsp') {
                if(!sp) {
                    error(token, "a005");
                    return null;
                }

                return {variant: 'w', reg: 'wsp', code: 15};
            }

            if(str === 'wzr') {
                if(!zr) {
                    error(token, "a015");
                    return null;
                }

                return {variant: 'w', reg: 'wzr', code: 31};
            }

            const match = str.match(/^w([0-9][0-9]*)$/);
            if(match === null) {
                // Invalid register name, expected a 32-bit register name
                return error(token, "a013");
            }

            if(match[1] > 30) {
                // Invalid register number
                error(token, "a011", [match[1]]);
                return null;
            }

            return {variant: 'w', reg: str, code: +match[1]};
        }

        return null;
    }

    /**
     * Throw an assembly error.
     * @param token Token near where error occurred
     * @param code Error code form the AssemblerError object
     * @param args Optional array of arguments to the error.
     * @returns {null}
     */
    const error = (token, code, args) => {
        return assembler.error(token, code, args);
    }
}