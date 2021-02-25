/**
 * Lexical analyzer tokens.
 */

export const Token = function(type, match, value, line, char) {
    // this.name = () => {
    //     return Token.toName(type);
    // }

    /**
     * Test for a token type and value. Returns true
     * if both are equal.
     * @param type Expected token type
     * @param value Expected token value
     * @returns {boolean}
     */
    this.is = (type, value) => {
        return this.type === type && this.value === value;
    }

    this.makeValueLowerCase = () => {
        value = value.toLowerCase();
    }

    this.match = match;
    this.type = type;
    this.line = line;
    this.char = char;

    Object.defineProperties(this, {
        'name': { get: () => { return Token.toName(type) } },
        'value': {get: function() {return value; }}
    })

 //   console.log("Token[" + line + "," + char + "]: " + this.name() + ' ' + value);

}

Token.toName = (type) => {
    switch(type) {
        case Token.EOL:
            return 'EOL';

        case Token.CHAR:
            return 'CHAR';

        case Token.DIRECTIVE:
            return 'DIRECTIVE';

        case Token.SYMBOL:
            return 'SYMBOL';

        case Token.COMMA:
            return 'COMMA';

        case Token.WHITESPACE:
            return 'WHITESPACE';

        case Token.LABEL:
            return 'LABEL';

        case Token.IMMEDIATE:
            return 'IMMEDIATE';

        case Token.NUMBER:
            return 'NUMBER';

        case Token.OPENBRACKET:
            return 'OPENBRACKET'

        case Token.CLOSEBRACKET:
            return 'CLOSEBRACKET'

        case Token.BANG:
            return 'BANG'
    }

    return 'UNKNOWN ' + this.type;
}

Token.debugDump = function(tokens) {
    for(let token of tokens) {
        console.log(token.name + ' ' + token.value);
    }
}

Token.EOL = 1;
Token.DIRECTIVE = 2;
Token.LABEL = 3;
Token.SYMBOL = 4;
Token.WHITESPACE = 5;
Token.COMMA = 6;
Token.IMMEDIATE = 7;
Token.NUMBER = 8;
Token.CHAR = 9;
Token.OPENBRACKET = 10;     // [
Token.CLOSEBRACKET = 11;    // ]
Token.BANG = 12;            // !