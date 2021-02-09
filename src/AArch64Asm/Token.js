/**
 * Lexical analyzer tokens.
 */

export const Token = function(type, value, line, char) {
    this.name = () => {
        switch(this.type) {
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
        }

        return 'UNKNOWN ' + this.type;
    }

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

    this.type = type;
    this.value = value;
    this.line = line;
    this.char = char;

 //   console.log("Token[" + line + "," + char + "]: " + this.name() + ' ' + value);

}

Token.EOL = 0;
Token.CHAR = 1;
Token.DIRECTIVE = 2;
Token.LABEL = 3;
Token.SYMBOL = 4;
Token.WHITESPACE = 5;
Token.COMMA = 6;
Token.IMMEDIATE = 7;
Token.NUMBER = 8;