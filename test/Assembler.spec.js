
import {Assembler} from '../src/Assembler';
import {AssemblyValidator} from "./Instructions/Matchers/AssemblyValidator";

describe('Assembler', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('Construct', function() {
        const assembler = new Assembler();
    });


    it('first asm program', function() {
        const assembler = new Assembler();

        const program = `// 
// Simple program that adds four numbers
//
 
.text

.global add4


add4:
    add x2, x2, x3  // x2 = x2 + x3
    add x0, x0, x1  // x0 = x0 + x1
    add x0, x0, x2  // x0 = x0 + x2

    ret     // return`;

        const expected = `
           2              	// 
   3              	// Simple program that adds four numbers
   4              	//
   5              	 
   6              	.text
   7              	
   8              	.global add4
   9              	
  10              	
  11              	add4:
  12 0000 4200038B 	    add x2, x2, x3  // x2 = x2 + x3
  13 0004 0000018B 	    add x0, x0, x1  // x0 = x0 + x1
  14 0008 0000028B 	    add x0, x0, x2  // x0 = x0 + x2
  15              	
  16 000c C0035FD6 	    ret     // return
`
        expect(program).toAssembleTo(expected)
    });

});

