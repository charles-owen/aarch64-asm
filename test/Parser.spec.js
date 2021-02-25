import {Lexer} from "../src/Lexer";
import {Parser} from "../src/Parser";

describe('Parser', function() {

    let result = {}
    let rule = '';

    const save = (description, results) => {
        result = results;
        rule = description;
        // console.log(description);
        // for(let name in results) {
        //     console.log(name + '=' + results[name])
        // }
    }

    it('first test', function() {


        const parser = new Parser();

        parser.pattern('<Xd|SP>, <Xn|SP>, #<imm12>(, <shift:lsl> #<amt>)', (results)=> {
            save('64-bit variant immediate', results)
        })

        parser.pattern('<Wd|WSP>, <Wn|WSP>, #<imm12>(, <shift:lsl> #<amt>)', (results)=> {
            save('32-bit variant immediate', results)
        })

        parser.pattern('<Xd>, <Xn>, <Xm>(, <shift:lsl|lsr|asr> #<amt>)', (results)=> {
            save('64-bit variant shifted register', results)
        })


        parser.pattern('<Wd>, <Wn>, <Wm>(, <shift:lsl|lsr|asr> #<amt>)', (results)=> {
            save('32-bit variant shifted register', results)
        })

        parser.pattern('<Xd|SP>, <Xn|SP>, <Rm>, <extend64>(#<amt>)', (results)=> {
            save('64-bit variant extended register', results)
        })

        parser.pattern('<Wd|WSP>, <Wn|WSP>, <Wm>, <extend32>(#<amt>)', (results)=> {
            save('32-bit variant extended register', results)
        })

        const tests = [
            ['w3, w30, wzr', {Rd:3, Rn:30, Rm:31}],
            ['x1, x9, x21', {Rd:1, Rn:9, Rm:21}],
            ['x1, xzr, x21', {Rd:1, Rn:31, Rm:21}],
            ['x1, x3, w7, uxtb', {Rd:1, Rn:3, Rm:7, extend64:0}],
            ['w2, wsp, w12, uxtb', {Rd:2, Rn:31, Rm:12, extend32:0}],
            ['x23, x19, #15', {Rd:23, Rn: 19, imm12:15}],
            ['x12, x14, #23, lsl #12', {Rd:12, Rn: 14, imm12:23, shift:'lsl', amt:12}],
            ['w12, w1, #30', {Rd:12, Rn:1, imm12:30}],
            ['x23, x18, x2, lsr #5', {Rd:23, Rn:18, Rm:2, shift:'lsr', amt:5}],
            ['w23, w18, w5, asr #5', {Rd:23, Rn:18, Rm:5, shift:'asr', amt:5}],
            ['wsp, w7, w1, uxtb', {Rd:31, Rn:7, Rm:1, extend32:0}]
        ];

        for(let test of tests) {
            const lexer = new Lexer();
            lexer.scan(test[0]);

            const tokens = lexer.tokens;
            // for(let token of tokens) {
            //     console.log(token.name);
            // }

            result = {xx:99}
            rule = '';
            parser.parse(tokens);
            expect(result).toEqual(test[1]);
        }


    })

    it('ret (Xn)', function() {
        const parser = new Parser();
        parser.pattern('(<Xn>)', (results)=> {
            save('ret', results)
        })

        const tests = [
            ['ret x23', {Rn: 23}],
            ['ret', {}]
        ];

        for(let test of tests) {
            const lexer = new Lexer();
            lexer.scan(test[0]);

            const tokens = lexer.tokens;
            // for(let token of tokens) {
            //     console.log(token.name);
            // }

            result = {xx:99}
            rule = '';
            parser.parse(tokens, 1);
            expect(result).toEqual(test[1]);
        }

    })
})
