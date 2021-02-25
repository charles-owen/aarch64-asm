import {Token} from "./Token";

/**
 * Node in the parse tree
 * @constructor
 */
export const ParseNode = function(name, type, src, expected=0) {

    const children = [];

    this.handler = null;
    this.value = null;

    // This is used to set an error based on
    // the supplied when testing the parsing.
    this.overrideError = null

    Object.defineProperties(this, {
        'name': { get: () => { return name } },
        'children': { get: () => { return children } },
        'type': { get: () => { return type } },
        'expected': { get: () => { return expected } }
    })

    /**
     * Reset node prior to parsing.
     */
    this.reset = () => {
        this.overrideError = null;
        for(let child of children) {
            child.reset();
        }
    }

    this.appendChildren = (nodes) => {
        for(let node of nodes) {
            children.push(node);
        }
    }

    this.appendToLeaves = (nodes) => {
        // Do not append to a terminal node
        if(type === ParseNode.TERM) {
            return;
        }

        if(children.length === 0) {
            for(let node of nodes) {
                children.push(node);
            }
        } else {
            for(let child of children) {
                child.appendToLeaves(nodes);
            }
        }
    }

    this.dump = (depth=1) => {
        let space = '';
        for(let i=1; i<=depth; i++) {
            space += '   ';
        }
        console.log(space + depth + ': ' + name + " " + type + ' ' + src);
        for(let child of children) {
            child.dump(depth+1);
        }
    }

    this.findChild = (token) => {
        for(let child of children) {
            if(child.match(token)) {
                return child;
            }
        }

        return null;
    }

    this.error = (code, args={}) => {
        this.overrideError = {code: code, args: args}
        return false;
    }

    const registerProcessing = (token, variant) => {
        if (token.type === Token.SYMBOL) {
            if(/w?sp/i.test(token.value)) {
                return this.error('a107');
            }

            let re = new RegExp('^' + variant + '([0-9]+)', 'i');
            const match = token.value.match(re)
            if(match !== null) {
                if (match[1] <= 30) {
                    this.value = +match[1];
                    return true;
                } else {
                    return this.error('a011', [match[1]]);
                }
            }
        }

        return false;
    }

    this.match = (token) => {
        switch(type) {
            case ParseNode.XREG:
                return registerProcessing(token,'x');

            case ParseNode.SP:
                this.value = 31;
                return token.type === Token.SYMBOL && token.value.toLowerCase() === 'sp'

            case ParseNode.XZR:
                this.value = 31;
                return token.type === Token.SYMBOL && token.value.toLowerCase() === 'xzr'

            case ParseNode.WREG:
                return registerProcessing(token,'w');

            case ParseNode.WSP:
                this.value = 31;
                return token.type === Token.SYMBOL && token.value.toLowerCase() === 'wsp'

            case ParseNode.WZR:
                this.value = 31;
                return token.type === Token.SYMBOL && token.value.toLowerCase() === 'wzr'

            case ParseNode.TOKEN:
                if(token.type === expected) {
                    this.value = token.value;
                    return true;
                }
                break;

            case ParseNode.STRING:
                this.value = token.value.toLowerCase()
                return token.type === Token.SYMBOL && token.value.toLowerCase() === expected

            case ParseNode.DIRECTIVE:
                this.value = token.value.toLowerCase()
                return token.type === Token.DIRECTIVE && token.value.toLowerCase() === expected

            case ParseNode.EXTEND32:
                const xtnds32 = {uxtb: 0, uxth: 1, uxtw: 2, uxtx: 3,
                                 sxtb: 4, sxth: 5, sxtw: 6, sxtx: 7, lsl: 2}
                if(token.type === Token.SYMBOL && xtnds32.hasOwnProperty(token.value)) {
                    this.value = xtnds32[token.value]
                    return true;
                }
                break;

            case ParseNode.EXTEND64:
                const xtnds64 = {uxtb: 0, uxth: 1, uxtw: 2, uxtx: 3,
                    sxtb: 4, sxth: 5, sxtw: 6, sxtx: 7, lsl: 3}
                if(token.type === Token.SYMBOL && xtnds64.hasOwnProperty(token.value)) {
                    this.value = xtnds64[token.value]
                    return true;
                }
                break;

            case ParseNode.SHIFT4:
                const shift4 = {lsl: 0, lsr: 1, asr: 2, ror: 3}
                if(token.type === Token.SYMBOL && shift4.hasOwnProperty(token.value)) {
                    this.value = shift4[token.value]
                    return true;
                }
                break;

            case ParseNode.IMM32:
                this.value = +token.value
                if(token.type === Token.NUMBER && token.value >= 0 && token.value < 32) {
                    return true;
                }
                break;

            case ParseNode.IMM64:
                this.value = +token.value;
                if(token.type === Token.NUMBER && token.value >= 0 && token.value < 64) {
                    return true;
                }
                break;
        }

        return false;
    }

    this.hasTerm = () => {
        for(let child of children) {
            if(child.type === ParseNode.TERM) {
                return child
            }
        }

        return null;
    }

    this.merge = (nodes) => {
        for(let node of nodes) {
            // Does this node already exist?
            let any = false;
            for(let child of children) {
                if(node.equivalent(child)) {
                    // Nodes already exists. Merge our children
                    // with it.
                    any = true;
                    child.merge(node.children);
                    break;
                }
            }

            // If not merged with any children,
            // this is a new child of this node.
            if(!any) {
                children.push(node);
            }

        }
    }

    this.equivalent = (node) => {
        if(node.name !== name || node.type !== type) {
            return false;
        }

        switch(type) {
            case ParseNode.TOKEN:
            case ParseNode.STRING:
                return (node.expected === expected)
        }

        return true;
    }

    this.expectation = () => {
        switch(type) {
            case ParseNode.XREG:
                return {msg:'64-bit (X) register name', code:'a014'}

            case ParseNode.XZR:
                return null;

            case ParseNode.TERM:
                return {msg: 'the end of the command', code:'a122'}

            case ParseNode.EXTEND32:
            case ParseNode.EXTEND64:
                return {msg: 'uxtb, uxth, lsl, uxtx, sxtb, sxth, sxtw, sxtx, or lsl',
                    code: 'a133'}

            case ParseNode.SHIFT4:
                return {msg: "lsl, lsr, asr, or ror", code: 'a130'}

            case ParseNode.TOKEN:
                switch(expected) {
                    case Token.IMMEDIATE:
                        return {msg: "immediate value", code: 'a101'}

                    default:
                        return {msg: Token.toName(expected), code: 'a500'}
                }
                break;

            case ParseNode.IMM32:
                return {msg: "immediate value in range 0-31", code: 'a134'}

            case ParseNode.IMM64:
                return {msg: "immediate value in range 0-63", code: 'a135'}

            case ParseNode.DIRECTIVE:
                return {msg: "assembler directive", code: 'a803', args: [expected]}
        }

        return null;
    }
}

ParseNode.XREG = 0;     // x0-x30 register
ParseNode.XZR = 1;      // xzr register
ParseNode.SP = 2;       // sp register
ParseNode.WREG = 3;     // x0-x30
ParseNode.WZR = 4;      // wzr register
ParseNode.WSP = 5;      // wsp register
ParseNode.TOKEN = 6;    // Token.* node
ParseNode.STRING = 8;   // Must match given string
ParseNode.EXTEND32 = 9;   // uxtb|uxth|lsl|uxtx|sxtb|sxth|sxtw|sxtx
ParseNode.EXTEND64 = 10;   // uxtb|uxth|uxtw|lsl|sxtb|sxth|sxtw|sxtx
ParseNode.SHIFT4 = 11;  // lsl|lsr|asr|ror
ParseNode.IMM32 = 12;   // Immediate value in the range 0-31
ParseNode.IMM64 = 13;   // Immediate value in the range 0-63
ParseNode.DIRECTIVE = 14;   // Node is an assembler directive

ParseNode.ROOT = 98;    // Root node
ParseNode.TERM = 99;    // Terminal node
