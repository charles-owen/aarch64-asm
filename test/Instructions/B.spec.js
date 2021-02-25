import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('B/BL', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('B instruction coding', function () {

        const program = `
main:
    nop
    nop
    b main
here: 
    b here
    b done
    nop
    nop
done:
    b here
    ret 
    
    beq main
    bne main
    bge main
    blt main
    bgt main
    ble main
    bhi main
    bls main
    bhs main
    bcs main
    blo main
    bcc main
    bmi main
    bpl main
    bvs main
    bvc main 
    
    b.eq main
    bne main
    bge main
    blt main
    bgt main
    ble main
    bhi main
    bls main
    bhs main
    bcs main
    blo main
    bcc main
    bmi main
    bpl main
    bvs main
    bvc main 
    
`;

        const expected = `
        3              	main:
   4 0000 1F2003D5      nop
   5 0004 1F2003D5      nop
   6 0008 FEFFFF17      b main
   7               here: 
   8 000c 00000014      b here
   9 0010 03000014      b done
  10 0014 1F2003D5      nop
  11 0018 1F2003D5      nop
  12               done:
  13 001c FCFFFF17      b here
  14 0020 C0035FD6      ret 
  15                   
  16 0024 E0FEFF54      beq main
  17 0028 C1FEFF54      bne main
  18 002c AAFEFF54      bge main
  19 0030 8BFEFF54      blt main
  20 0034 6CFEFF54      bgt main
  21 0038 4DFEFF54      ble main
  22 003c 28FEFF54      bhi main
  23 0040 09FEFF54      bls main
  24 0044 E2FDFF54      bhs main
  25 0048 C2FDFF54      bcs main
  26 004c A3FDFF54      blo main
  27 0050 83FDFF54      bcc main
  28 0054 64FDFF54      bmi main
  29 0058 45FDFF54      bpl main
  30 005c 26FDFF54      bvs main
  31 0060 07FDFF54      bvc main 
  32                   
  33 0064 E0FCFF54      b.eq main
  34 0068 C1FCFF54      b.ne main
  35 006c AAFCFF54      b.ge main
  36 0070 8BFCFF54      b.lt main
  37 0074 6CFCFF54      b.gt main
  38 0078 4DFCFF54      b.le main
  39 007c 28FCFF54      b.hi main
  40 0080 09FCFF54      b.ls main
  41 0084 E2FBFF54      b.hs main
  42 0088 C2FBFF54      b.cs main
  43 008c A3FBFF54      b.lo main
  44 0090 83FBFF54      b.cc main
  45 0094 64FBFF54      b.mi main
  46 0098 45FBFF54      b.pl main
  47 009c 26FBFF54      b.vs main
  48 00a0 07FBFF54      b.vc main
        `

        expect(program).toAssembleTo(expected)
    });

    it('BL instruction coding', function () {

        const program = `
main:
    nop
    nop
    bl main
here: 
    bl here
    bl done
    nop
    nop
done:
    bl here
    ret 
`;

        const expected = `
   3              	main:
   4 0000 1F2003D5 	    nop
   5 0004 1F2003D5 	    nop
   6 0008 FEFFFF97 	    bl main
   7              	here: 
   8 000c 00000094 	    bl here
   9 0010 03000094 	    bl done
  10 0014 1F2003D5 	    nop
  11 0018 1F2003D5 	    nop
  12              	done:
  13 001c FCFFFF97 	    bl here
  14 0020 C0035FD6 	    ret 
  `

        expect(program).toAssembleTo(expected)
    });


})
