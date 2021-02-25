import {ParseNode} from "./ParseNode";
import {Token} from "./Token";

export const Parser = function() {

    let handler = null;

    const root = new ParseNode('root', ParseNode.ROOT, '');

    this.errorHandler = function(token, code, args={}) {
    }


    this.pattern = (pattern, _handler) => {
       // console.log(pattern);

        handler = _handler;

        //
        // Break into simple tokens
        //
        const patternTokens = [];

        const itemRE = /^(?:(<[^>]*>)|("[^"]*"))/
        while(pattern.length > 0) {
            const match = pattern.match(itemRE);
            if(match !== null) {
                patternTokens.push(match[0]);
                pattern = pattern.substr(match[0].length);
            } else {
                const ch = pattern[0];
                pattern = pattern.substr(1);
                if(/\s/.test(ch)) {
                    continue;
                }
                patternTokens.push(ch);
            }
        }

        const nodes = patternParse(patternTokens, 0);
        root.merge(nodes.nodes)

        // root.dump();
    }

    this.parse = (tokens, start=0) => {
        root.reset();
        let results = {}

        // Position in the parsing graph
        let position = root;
        for(let i=start; i<tokens.length; i++) {
            const token = tokens[i];
            const newPosition = position.findChild(token);
            if(newPosition === null) {
                    // for(const child of position.children) {
                    //     console.log(child.type);
                    // }

                // Error, the token is not valid at this point
                parseError(token, position)

                return;
            }

            position = newPosition;
            const name = position.name;
            if(name !== null) {
                results[name] = position.value;
            }

            // console.log('found: ' + position.type);
        }

        const term = position.hasTerm()
        if(term !== null) {
            term.handler(results, tokens);
        } else {
            // Error, we did not reach the end of the pattern
            // Something is missing
            parseError(tokens[tokens.length - 1], position);
        }
    }


    const patternParse = (tokens, position) => {
        if(position >= tokens.length) {
            // End of the input
            const term = new ParseNode(null, ParseNode.TERM, '')
            term.handler = handler;
            return {position: position, nodes: [term]}
        }

        const token = tokens[position];

        if(token === '(') {
            // Start of nested section
            position++;

            // Recursive call for the parenthesized tokens
            const child1 = patternParse(tokens, position);
            position = child1.position;

            // Rest of the expression
            const child2 = patternParse(tokens, position);
            position = child2.position;

            for(let node of child1.nodes) {
                node.appendToLeaves(child2.nodes);
            }

            return {position: position, nodes: child1.nodes.concat(child2.nodes)}
        } else if(token === ')') {
            position++;
            return {position: position, nodes: []}
        }

        // (?:\"(?:<content>[^\"]+)(?:<type>\"))
        const itemRE = /^(?:<(?<type>[^>]+)>)|(?:"(?<string>[^"]+))/
        const match = token.match(itemRE);
        let nodes = [];

        if(match !== null) {
            if(match.groups.type !== undefined) {
                // Option of the form <type>
                let contents = match.groups.type;
                let name = null;
                const matches = contents.match(/^(.*):(.*)$/)
                if (matches !== null) {
                    name = matches[1];
                    contents = matches[2];
                }

                const bracketItems = contents.split('|');
                const first = bracketItems[0];

                // Registers are special
                if (first[0] === 'X') {
                    // Xn register is renamed to Rn
                    const name = 'R' + first.substr(1);
                    nodes.push(new ParseNode(name, ParseNode.XREG, token))
                    if (bracketItems.includes('SP')) {
                        nodes.push(new ParseNode(name, ParseNode.SP, token))
                    } else {
                        nodes.push(new ParseNode(name, ParseNode.XZR, token))
                    }

                } else if (first[0] === 'W') {
                    const name = 'R' + first.substr(1);
                    nodes.push(new ParseNode(name, ParseNode.WREG, token))
                    if (bracketItems.includes('WSP')) {
                        nodes.push(new ParseNode(name, ParseNode.WSP, token))
                    } else {
                        nodes.push(new ParseNode(name, ParseNode.WZR, token))
                    }
                } else if(first[0] === 'R') {
                    // R means either X or W accepted
                    const name = first;
                    nodes.push(new ParseNode(name, ParseNode.XREG, token))
                    nodes.push(new ParseNode(name, ParseNode.WREG, token))
                    if (bracketItems.includes('SP')) {
                        nodes.push(new ParseNode(name, ParseNode.SP, token))
                    } else {
                        nodes.push(new ParseNode(name, ParseNode.XZR, token))
                    }
                    if (bracketItems.includes('WSP')) {
                        nodes.push(new ParseNode(name, ParseNode.WSP, token))
                    } else {
                        nodes.push(new ParseNode(name, ParseNode.WZR, token))
                    }
                } else {
                    if(name === null) {
                        name = first;
                    }

                    for(let item of bracketItems) {
                        const standard = standardNode(token, name, item)
                        if(standard !== null) {
                            nodes.push(standard);
                        }
                    }

                }
            }

            if(match.groups.string !== undefined) {
                // Constant strings like "nzcv"
                let contents = match.groups.string;
                nodes.push(new ParseNode(null, ParseNode.STRING, token, contents))
            }

        } else {
            switch(token) {
                case ',':
                    nodes.push(new ParseNode(null, ParseNode.TOKEN, token, Token.COMMA))
                    break;

                case '#':
                    nodes.push(new ParseNode(null, ParseNode.TOKEN, token, Token.IMMEDIATE))
                    break;

                case '[':
                    nodes.push(new ParseNode(null, ParseNode.TOKEN, token, Token.OPENBRACKET))
                    break

                case ']':
                    nodes.push(new ParseNode(null, ParseNode.TOKEN, token, Token.CLOSEBRACKET))
                    break

                case '!':
                    nodes.push(new ParseNode(null, ParseNode.TOKEN, token, Token.BANG))
                    break
            }

        }

        // Consumed one token
        position++;
        if(nodes.length === 0) {
            console.log('No node generated for ' + token);
        }
        // Recursive call for the rest of the tokens
        const child = patternParse(tokens, position);
        position = child.position;

        for(let node of nodes) {
            node.appendChildren(child.nodes);
        }

        return {position: position, nodes: nodes}
    }

    const standardNode = (token, name, item) => {
        const standards = ['lsl', 'lsr', 'asr', 'ror', 'rol']
        if(standards.includes(item)) {
            return new ParseNode(name, ParseNode.STRING, token, item);
        }

        switch(item) {
            case 'imm32':
                return new ParseNode(name, ParseNode.IMM32, token, Token.NUMBER)

            case 'imm64':
                return new ParseNode(name, ParseNode.IMM64, token, Token.NUMBER)

            case 'extend32':
                return new ParseNode(name, ParseNode.EXTEND32, token)

            case 'extend64':
                return new ParseNode(name, ParseNode.EXTEND64, token)

            case 'shift4':
                return new ParseNode(name, ParseNode.SHIFT4, token)

            case 'symbol':
                return new ParseNode(name, ParseNode.TOKEN, token, Token.SYMBOL)
        }

        if(/^(imm)|(amt)/.test(item)) {
            return new ParseNode(name, ParseNode.TOKEN, token, Token.NUMBER)
        }

        if(/^\./.test(item)) {
            return new ParseNode(name, ParseNode.DIRECTIVE, token, item);
        }

        return null;
    }


    const parseError = (token, position) => {
        let expected = '';
        const expectations = []
        for(const child of position.children) {
            if(child.overrideError !== null) {
                this.errorHandler(token, child.overrideError.code, child.overrideError.args);
                return;
            }

            const expectation = child.expectation();
            if(expectation !== null) {
                expectations.push(expectation);
                if(expected !== '') {
                    expected += ' or ';
                }

                expected += expectation.msg;
            }

        }

        // If we have only one expectation,, use the error code
        // provided for that expectation. Otherwise use the a500
        // general parse error and the combined message.
        if(expectations.length === 1) {
            this.errorHandler(token, expectations[0].code)

        } else {
            this.errorHandler(token, 'a500', [expected]);

        }
    }
}