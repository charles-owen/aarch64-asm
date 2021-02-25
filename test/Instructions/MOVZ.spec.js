import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('MOVZ', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `
    movz w0, #0x1234        // w0 ← 0x1234
    movz w6, #12, lsl #16   // w6 ← 12<<16 (786,432)
    
    movz x3, #0xffff        // x3 ← 0xffff
    movz x4, #7, lsl #16    // x4 ← 0x70000
    movz x5, #7, lsl #32    // x5 ← 0x700000000
    movz x21, #15, lsl #48 
`;

        const expected = `
   2 0000 80468252 	    movz w0, #0x1234        // w0 ← 0x1234
   3 0004 8601A052 	    movz w6, #12, lsl #16   // w6 ← 12<<16 (786,432)
   4              	    
   5 0008 E3FF9FD2 	    movz x3, #0xffff        // x3 ← 0xffff
   6 000c E400A0D2 	    movz x4, #7, lsl #16    // x4 ← 0x70000
   7 0010 E500C0D2 	    movz x5, #7, lsl #32    // x5 ← 0x700000000
   8 0014 F501E0D2 	    movz x21, #15, lsl #48
`
        expect(program).toAssembleTo(expected)
    });

    it('errors', function () {

        const program = `
movz x0, #
movz x7, #123, lsl #48
`;

        expect(program).toHaveErrors(['a123']);
    });
})
