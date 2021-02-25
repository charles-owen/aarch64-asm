import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('TST', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding (small test)', function () {

        const program = `
tst x1, x2

`;

        const expected = `
  3 0000 3F0002EA \ttst x1, x2

`
        expect(program).toAssembleTo(expected)
    });


    it('instruction coding (immediate)', function () {

        const program = `
tst x0, #2
tst w3, #0x3ff
tst w0, #0xe1e1e1e1
           \t             \t
tst x3, #6
tst x8, #0x1000100010001000
tst x30, #0b100000

`;

        const expected = `
   3 0000 1F007FF2 \ttst x0, #2
   4 0004 7F240072 \ttst w3, #0x3ff
   5 0008 1FCC0372 \ttst w0, #0xe1e1e1e1
   6              \t           \t             \t
   7 000c 7F047FF2 \ttst x3, #6
   8 0010 1F8104F2 \ttst x8, #0x1000100010001000
   9 0014 DF037BF2 \ttst x30, #0b100000
`
        expect(program).toAssembleTo(expected)
    });

    it('immediate', function () {

        const program = `
tst x1, x2
tst x23, x4 
tst x3, x2, lsl #4
            \t             \t
tst w2, w7
tst w17, w0 
tst w19, w0, lsl #30


`;

        const expected = `
   3 0000 3F0002EA \ttst x1, x2
   4 0004 FF0204EA \ttst x23, x4 
   5 0008 7F1002EA \ttst x3, x2, lsl #4
   6              \t            \t             \t
   7 000c 5F00076A \ttst w2, w7
   8 0010 3F02006A \ttst w17, w0 
   9 0014 7F7A006A \ttst w19, w0, lsl #30
`
        expect(program).toAssembleTo(expected)
    });


})
