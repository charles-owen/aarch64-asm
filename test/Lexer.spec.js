import {Lexer} from '../src/Lexer';
import {Token} from "../src/Token";

describe('Lexer', function() {

    it('Simple build', function() {
        const lexer = new Lexer();

        const program = `
/*
 * Example program
 */
.text
// This is a test

main:   adc x0, x1, x2
`;

        lexer.scan(program);
        const tokens = lexer.tokens;

        expect(tokens.length).toBe(16);
    });

    it('Immediate values', function() {
        const lexer = new Lexer();

        const program = `#1234 #-9876 #0xa89a #-0x678a #0b1011 #-0b11111111`;

        lexer.scan(program);
        const tokens = lexer.tokens;

        expect(tokens.length).toBe(12);

        expect(tokens[0].type).toBe(Token.IMMEDIATE);
        expect(tokens[1].type).toBe(Token.NUMBER);
        expect(tokens[1].value).toBe(1234);

        expect(tokens[2].type).toBe(Token.IMMEDIATE);
        expect(tokens[3].type).toBe(Token.NUMBER);
        expect(tokens[3].value).toBe(-9876);

        expect(tokens[4].type).toBe(Token.IMMEDIATE);
        expect(tokens[5].type).toBe(Token.NUMBER);
        expect(tokens[5].value).toBe(0xa89a);

        expect(tokens[6].type).toBe(Token.IMMEDIATE);
        expect(tokens[7].type).toBe(Token.NUMBER);
        expect(tokens[7].value).toBe(-0x678a);

        expect(tokens[8].type).toBe(Token.IMMEDIATE);
        expect(tokens[9].type).toBe(Token.NUMBER);
        expect(tokens[9].value).toBe(11);

        expect(tokens[10].type).toBe(Token.IMMEDIATE);
        expect(tokens[11].type).toBe(Token.NUMBER);
        expect(tokens[11].value).toBe(-255);



        // for(const token of tokens) {
        //     console.log(token);
        // }

    })


});