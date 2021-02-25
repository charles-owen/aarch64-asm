import {Directive} from "../Directive";
import {Token} from "../Token";

/**
 * Assembler directive: .global
 * @param assembler
 * @constructor
 */
export const GLOBAL = function(assembler) {
    Directive.call(this, assembler, '.global');

    this.parser.pattern('<.global> <symbol>', (values, tokens)=> {
        // Do nothing in the first pass
        if(assembler.pass === 1) {
            return;
        }

        // Find the symbol
        const symbol = assembler.symbols.get(values.symbol);
        if(symbol === null) {
            return error(tokens[1], 'a200', [values.symbol]);
        }

        symbol.global = true;
    })

}


GLOBAL.prototype = Object.create(Directive.prototype);
GLOBAL.prototype.constructor = GLOBAL;