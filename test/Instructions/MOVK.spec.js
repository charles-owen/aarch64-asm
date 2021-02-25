import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('MOVK', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `
    movk w0, #0x1234
    movk w6, #12, lsl #16
    
    movk x3, #0xffff 
    movk x4, #7, lsl #16
    movk x5, #7, lsl #32
    movk x21, #15, lsl #48 
`;

        const expected = `
   3 0000 80468272 	    movk w0, #0x1234
   4 0004 8601A072 	    movk w6, #12, lsl #16
   5              	    
   6 0008 E3FF9FF2 	    movk x3, #0xffff 
   7 000c E400A0F2 	    movk x4, #7, lsl #16
   8 0010 E500C0F2 	    movk x5, #7, lsl #32
   9 0014 F501E0F2 	    movk x21, #15, lsl #48 
`
        expect(program).toAssembleTo(expected)
    });
    
})
