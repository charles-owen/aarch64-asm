import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('MOV', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `
    mov x13, x22
    mov w5, w19
    
    mov w0, #0x1234 
    mov w6, #12
    
    mov x3, #0xffff 
    mov x4, #7 
    mov x5, #7
    mov x21, #15 
    
    mov x12, sp
    mov sp, x19
    
    mov X16, SP
    mov SP, X12
    
    mov w19, wsp
    mov wsp, w2
`;


        const expected = `
   2 0000 ED0316AA 	    mov x13, x22
   3 0004 E503132A 	    mov w5, w19
   4              	    
   5 0008 80468252 	    mov w0, #0x1234 
   6 000c 86018052 	    mov w6, #12
   7              	    
   8 0010 E3FF9FD2 	    mov x3, #0xffff 
   9 0014 E40080D2 	    mov x4, #7 
  10 0018 E50080D2 	    mov x5, #7
  11 001c F50180D2 	    mov x21, #15 
  12              	    
  13 0020 EC030091 	    mov x12, sp
  14 0024 7F020091 	    mov sp, x19
  15              	    
  16 0028 F0030091 	    mov X16, SP
  17 002c 9F010091 	    mov SP, X12
  18              	    
  19 0030 F3030011 	    mov w19, wsp
  20 0034 5F000011 	    mov wsp, w2
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
