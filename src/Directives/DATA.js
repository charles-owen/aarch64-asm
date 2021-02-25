import {Directive} from "../Directive";

/**
 * Assembler directive: .text
 * @param assembler
 * @constructor
 */
export const DATA = function(assembler) {
    Directive.call(this, assembler, '.data');
    
    /**
     * Set the section
     * @param {[Token]} tokens The tokens that represent the line
     */
    this.process = (tokens) => {
        assembler.setSection('data');
    }
}

DATA.prototype = Object.create(Directive.prototype);
DATA.prototype.constructor = DATA;