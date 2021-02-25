import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('MOVN', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `
    movn w0, #0x1234
    movn w6, #12, lsl #16
    
    movn x3, #0xffff 
    movn x4, #7, lsl #16
    movn x5, #7, lsl #32
    movn x21, #15, lsl #48 
`;

        const expected = `
   2 0000 80468212 	    movn w0, #0x1234
   3 0004 8601A012 	    movn w6, #12, lsl #16
   4              	    
   5 0008 E3FF9F92 	    movn x3, #0xffff 
   6 000c E400A092 	    movn x4, #7, lsl #16
   7 0010 E500C092 	    movn x5, #7, lsl #32
   8 0014 F501E092 	    movn x21, #15, lsl #48
`
        expect(program).toAssembleTo(expected)
    });
    
})
