import {Directive} from "../Directive";

/**
 * Assembler directive: .text
 * @param assembler
 * @constructor
 */
export const TEXT = function(assembler) {
    Directive.call(this, assembler, '.text');

    /**
     * Set the section
     * @param {[Token]} tokens The tokens that represent the line
     */
    this.process = (tokens) => {
        assembler.setSection('text');
    }
}

TEXT.prototype = Object.create(Directive.prototype);
TEXT.prototype.constructor = TEXT;