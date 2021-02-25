import {Component} from "./Component";
import {Parser} from "./Parser";

/**
 * Base object for assembler directives
 * @param assembler
 * @constructor
 */
export const Directive = function(assembler, name) {
    Component.call(this, assembler);

    Object.defineProperties(this, {
        'parser': {value: new Parser(assembler, this)},
        'name': {get: function() {return name}}
    })

    this.parser.errorHandler = (token, code, args={}) => {
        this.error(token, code, args)
    }

    /**
     * Default behavior for all directives is to parse.
     * The parse setup must be done in a derived object.
     * @param {[Token]} tokens The tokens that represent the line
     */
    this.process = (tokens) => {
        this.parser.parse(tokens);
    }
}

Directive.prototype = Object.create(Component.prototype);
Directive.prototype.constructor = Directive;