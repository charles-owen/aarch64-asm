import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('CMP', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })


    it('instruction coding (smaller)', function () {

        const program = `
cmp  x3, w7, uxtb
cmp  x3, w7, uxth
cmp  w7, w19, sxtb
`;

        const expected = `
   4 0000 7F0027EB \tcmp  x3, w7, uxtb
   5 0004 7F2027EB \tcmp  x3, w7, uxth
   6 0008 FF80336B \tcmp  w7, w19, sxtb
`
        expect(program).toAssembleTo(expected)
    });

    it('instruction coding', function () {

        const program = `
cmp x2, #-1300
cmn x17, #-23
cmp x2, #1300
cmp  w2, #99
cmp  w7, #99, lsl #12
        
cmp  x3, w7, uxtb
cmp  x3, w7, uxth
cmp  w7, w19, sxtb
        
cmp  x9, x21
cmp  w30, wzr
cmp  xzr, x0, lsl #20
cmp  wzr, w3, lsr #10
cmp  wzr, w3, asr #31

cmn x2, #1300
cmn  w2, #99
cmn  w7, #99, lsl #12
        
cmn  x3, w7, uxtb
cmn  x3, w7, uxth
cmn  w7, w19, sxtb
        
cmn  x9, x21
cmn  w30, wzr
cmn  xzr, x0, lsl #20
cmn  wzr, w3, lsr #10
cmn  wzr, w3, asr #31

`;

        const expected = `
  2 0000 5F5014B1 \tcmp x2, #-1300
   3 0004 3F5E00F1 \tcmn x17, #-23
   4 0008 5F5014F1 \tcmp x2, #1300
   5 000c 5F8C0171 \tcmp  w2, #99
   6 0010 FF8C4171 \tcmp  w7, #99, lsl #12
   7              \t        
   8 0014 7F0027EB \tcmp  x3, w7, uxtb
   9 0018 7F2027EB \tcmp  x3, w7, uxth
  10 001c FF80336B \tcmp  w7, w19, sxtb
  11              \t        
  12 0020 3F0115EB \tcmp  x9, x21
  13 0024 DF031F6B \tcmp  w30, wzr
  14 0028 FF5300EB \tcmp  xzr, x0, lsl #20
  15 002c FF2B436B \tcmp  wzr, w3, lsr #10
  16 0030 FF7F836B \tcmp  wzr, w3, asr #31
  17              \t
  18 0034 5F5014B1 \tcmn x2, #1300
  19 0038 5F8C0131 \tcmn  w2, #99
  20 003c FF8C4131 \tcmn  w7, #99, lsl #12
  21              \t        
  22 0040 7F0027AB \tcmn  x3, w7, uxtb
  23 0044 7F2027AB \tcmn  x3, w7, uxth
  24 0048 FF80332B \tcmn  w7, w19, sxtb
  25              \t        
  26 004c 3F0115AB \tcmn  x9, x21
  27 0050 DF031F2B \tcmn  w30, wzr
  28 0054 FF5300AB \tcmn  xzr, x0, lsl #20
  29 0058 FF2B432B \tcmn  wzr, w3, lsr #10
  30 005c FF7F832B \tcmn  wzr, w3, asr #31
`
        expect(program).toAssembleTo(expected)
    });

})
