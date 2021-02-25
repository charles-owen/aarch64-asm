import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('ADD/SUB', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('small', function() {

        const program = `
add x1, x9, x21

`;

        /*
  add w3, w30, wzr
add x12, xzr, x0, lsl #20
add w3, wzr, w3, lsr #10
adds w3, wzr, w3, asr #31
         */

        const expected = `
   7 0000 2101158B  add x1, x9, x21
`
        /*
    3 0004 C3031F0B 	add w3, w30, wzr
   4 0008 EC53008B 	add x12, xzr, x0, lsl #20
   5 000c E32B430B 	add w3, wzr, w3, lsr #10
   6 0010 E37F832B 	adds w3, wzr, w3, asr #31
         */
        expect(program).toAssembleTo(expected)
    })

    it('instruction coding', function () {

        const program = `
add x1, x2, #1300
add w1, w2, #99
adds w5, w7, #99, lsl #12
        
add x1, x3, w7, uxtb
add x1, x3, w7, uxth
adds w4, w7, w19, sxtb
        
add x1, x9, x21
add w3, w30, wzr
add x12, xzr, x0, lsl #20
add w3, wzr, w3, lsr #10
adds w3, wzr, w3, asr #31

sub x1, x2, #1300
sub w1, w2, #99
subs w5, w7, #99, lsl #12
        
sub x1, x3, w7, uxtb
sub x1, x3, w7, uxth
subs w4, w7, w19, sxtb
        
sub x1, x9, x21
sub w3, w30, wzr
sub x12, xzr, x0, lsl #20
sub w3, wzr, w3, lsr #10
subs w3, wzr, w3, asr #31
        
`;

        const expected = `
        
   3 0000 41501491 \tadd x1, x2, #1300
   4 0004 418C0111 \tadd w1, w2, #99
   5 0008 E58C4131 \tadds w5, w7, #99, lsl #12
   6              \t        
   7 000c 6100278B  add x1, x3, w7, uxtb
   8 0010 6120278B \tadd x1, x3, w7, uxth
   9 0014 E480332B  adds w4, w7, w19, sxtb
  10              \t        
  11 0018 2101158B  add x1, x9, x21
  12 001c C3031F0B \tadd w3, w30, wzr
  13 0020 EC53008B \tadd x12, xzr, x0, lsl #20
  14 0024 E32B430B  add w3, wzr, w3, lsr #10
  15 0028 E37F832B \tadds w3, wzr, w3, asr #31
  16              \t
  17 002c 415014D1 \tsub x1, x2, #1300
  18 0030 418C0151 \tsub w1, w2, #99
  19 0034 E58C4171 \tsubs w5, w7, #99, lsl #12
  20              \t        
  21 0038 610027CB \tsub x1, x3, w7, uxtb
  22 003c 612027CB \tsub x1, x3, w7, uxth
  23 0040 E480336B \tsubs w4, w7, w19, sxtb
  24              \t        
  25 0044 210115CB sub x1, x9, x21
  26 0048 C3031F4B sub w3, w30, wzr
  27 004c EC5300CB sub x12, xzr, x0, lsl #20
  28 0050 E32B434B sub w3, wzr, w3, lsr #10
  29 0054 E37F836B subs w3, wzr, w3, asr #31
`
        expect(program).toAssembleTo(expected)
    });

})
