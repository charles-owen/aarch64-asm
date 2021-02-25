import {Token} from './Token';

export const Lexer = function() {
    this.x = 23;

    let source = '';
    this.lines = [];

    let line = 0;
    let char = 0;

    let rules = [];

    this.tokens = [];

    const init = () => {
        // end of line
        addRule(/^[\r\n]/, (match) => {
        })

        // assembler directive
        addRule(/^\.[a-zA-Z][a-zA-Z0-9\-_]*/, (match) => {
            this.tokens.push(new Token(Token.DIRECTIVE, match[0], match[0].toLowerCase(), line, char));
        })

        // label
        addRule(/^([a-zA-Z_\$][a-zA-Z0-9_\$]*):/, (match) => {
            this.tokens.push(new Token(Token.LABEL, match[0], match[1], line, char));
        })

        // symbol
        addRule(/^[a-zA-Z_\$][a-zA-Z0-9_\.\$]*/, (match) => {
            this.tokens.push(new Token(Token.SYMBOL, match[0], match[0], line, char));
        })

        // immediate
        addRule(/^#/, (match) => {
            this.tokens.push(new Token(Token.IMMEDIATE, match[0], '#', line, char));
        })

        // open bracket
        addRule(/^\[/, (match) => {
            this.tokens.push(new Token(Token.OPENBRACKET, match[0], '[', line, char));
        })

        // close bracket
        addRule(/^\]/, (match) => {
            this.tokens.push(new Token(Token.CLOSEBRACKET, match[0], ']', line, char));
        })

        // exclamation mark (bang)
        addRule(/^!/, (match) => {
            this.tokens.push(new Token(Token.BANG, match[0], '!', line, char));
        })

        // decimal literal
        addRule(/^(-?\+?)([0-9]+)/, (match) => {
            if(match[1] === '-') {
                this.tokens.push(new Token(Token.NUMBER, match[0], -match[2], line, char));
            } else {
                this.tokens.push(new Token(Token.NUMBER, match[0], +match[2], line, char));
            }
        })

        // hex literal
        addRule(/^(-?\+?0x[0-9a-fA-F]+)/, (match) => {
            this.tokens.push(new Token(Token.NUMBER, match[0], parseInt(match[1]), line, char));
        })

        // binary literal
        addRule(/^(-?\+?)0b([0-9a-fA-F]+)/, (match) => {
            let num = parseInt(match[2], 2);
            if(match[1] === '-') {
                num = -num;
            }
            this.tokens.push(new Token(Token.NUMBER, match[0], num, line, char));
        })


        // whitespace
        addRule(/^\s+/, (match) => {
          //  this.tokens.push(new Token(Token.WHITESPACE, match[0], match[0].length, line, char));
        })

        // comma
        addRule(/^\s*,\s*/, (match) => {
            this.tokens.push(new Token(Token.COMMA, match[0], ',', line, char));
        })
    }

    const addRule = (regex, func) => {
        rules.push({regex: regex, func: func});


    }

    this.scan = (_source) => {
        // Beginning of the file
        line = 0;
        char = 0;

        source = _source;
        this.lines = source.split('\n');

        while(source.length > 0) {
            // Ignore any /* */ comments
            if(source.match(/^\/\*/) !== null) {
                // Search for the comment end
                let i = 0;
                for( ; i<source.length-1; i++) {
                    if(source[i] === '*' && source[i+1] === '/') {
                        // End of comment
                        i += 2;
                        break;
                    }
                }

                advance(i);
                continue;
            }

            // Ignore // comments to end of the line
            if(source.match(/^\/\//) !== null) {
                // Search for the comment end
                let i = 0;
                for( ; i<source.length; i++) {
                    if(source[i] === '\n' || source[i] === '\r') {
                        // End of comment
                        i++;
                        break;
                    }
                }

                advance(i);
                continue;
            }

            // Best regular expression match
            let best = null;
            let bestRule = null;
            let bestLen = 0;

            for(const rule of rules) {
                const regex = rule.regex;
                const result = source.match(regex);
                if(result !== null) {
                    const newLen = result[0].length;
                    if(newLen > bestLen) {
                        best = result;
                        bestLen = newLen;
                        bestRule = rule;
                    }
                }
            }

            if(best !== null) {
                bestRule.func(best);
                advance(bestLen);
            } else {
                // Default rule, no rule matched.
                // Advance by one.
                this.tokens.push(new Token(Token.CHAR, source[0], source[0], line, char));
                advance(1);
            }

        }

    }

    const advance = (amount) => {
        // Line and character counting
        for(let i=0; i<amount; i++) {
            const c = source[i];
            if(c === '\n') {
                this.tokens.push(new Token(Token.EOL, c, '', line, char));
                line++;
                char=0;
            } else {
                char++;
            }
        }

        source = source.substring(amount);
    }

    init();
}

