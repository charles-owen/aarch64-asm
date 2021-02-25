import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('LDR/STP', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })


    it('small', function () {

        const program = `
stp x29, x30, [sp, #104]
`;

        const expected = `
   3 0000 FDFB06A9  stp x29, x30, [sp, #104]
`
        expect(program).toAssembleTo(expected)
    });

    it('post index', function () {

        const program = `
stp x29, x30, [sp], #104
stp x18, x10, [sp], #-80
stp x3, x22, [sp], #-512
stp x9, x10, [sp], #504

stp w29, w30, [sp], #104
stp w4, w7, [sp], #0
stp w9, w18, [sp], #-40
stp w2, w15, [sp], #-256
stp w0, w1, [sp], #252
`;

        const expected = `
   3 0000 FDFB86A8 \tstp x29, x30, [sp], #104
   4 0004 F22BBBA8 \tstp x18, x10, [sp], #-80
   5 0008 E35BA0A8 \tstp x3, x22, [sp], #-512
   6 000c E9AB9FA8 \tstp x9, x10, [sp], #504
   7              \t
   8 0010 FD7B8D28 \tstp w29, w30, [sp], #104
   9 0014 E41F8028 \tstp w4, w7, [sp], #0
  10 0018 E94BBB28 \tstp w9, w18, [sp], #-40
  11 001c E23FA028 \tstp w2, w15, [sp], #-256
  12 0020 E0879F28 \tstp w0, w1, [sp], #252
`
        expect(program).toAssembleTo(expected)
    });

    it('pre index', function () {

        const program = `
stp x29, x30, [sp, #104]!
stp x18, x10, [sp, #-80]!
stp x3, x22, [sp, #-512]!
stp x9, x10, [sp, #504]!

stp w29, w30, [sp, #104]!
stp w4, w7, [sp, #0]!
stp w9, w18, [sp, #-40]!
stp w2, w15, [sp, #-256]!
stp w0, w1, [sp, #252]!
`;

        const expected = `
   3 0000 FDFB86A9 \tstp x29, x30, [sp, #104]!
   4 0004 F22BBBA9 \tstp x18, x10, [sp, #-80]!
   5 0008 E35BA0A9 \tstp x3, x22, [sp, #-512]!
   6 000c E9AB9FA9 \tstp x9, x10, [sp, #504]!
   7              \t
   8 0010 FD7B8D29 \tstp w29, w30, [sp, #104]!
   9 0014 E41F8029 \tstp w4, w7, [sp, #0]!
  10 0018 E94BBB29 \tstp w9, w18, [sp, #-40]!
  11 001c E23FA029 \tstp w2, w15, [sp, #-256]!
  12 0020 E0879F29 \tstp w0, w1, [sp, #252]!
`
        expect(program).toAssembleTo(expected)
    });


    it('signed offset', function () {

        const program = `
stp x29, x30, [sp, #104]
stp x18, x10, [x0, #-80]
stp x3, x22, [x1, #-512]
stp x30, x2, [x4]
stp x9, x10, [sp, #504]

stp w29, w30, [sp, #104]
stp w4, w7, [x0, #0]
stp w4, w7, [x1]
stp w9, w18, [x7, #-40]
stp w2, w15, [sp, #-256]
stp w0, w1, [sp, #252]
`;

        const expected = `
   3 0000 FDFB06A9 \tstp x29, x30, [sp, #104]
   4 0004 12283BA9 \tstp x18, x10, [x0, #-80]
   5 0008 235820A9 \tstp x3, x22, [x1, #-512]
   6 000c 9E0800A9 \tstp x30, x2, [x4]
   7 0010 E9AB1FA9 \tstp x9, x10, [sp, #504]
   8              \t
   9 0014 FD7B0D29 \tstp w29, w30, [sp, #104]
  10 0018 041C0029 \tstp w4, w7, [x0, #0]
  11 001c 241C0029 \tstp w4, w7, [x1]
  12 0020 E9483B29 \tstp w9, w18, [x7, #-40]
  13 0024 E23F2029 \tstp w2, w15, [sp, #-256]
  14 0028 E0871F29 \tstp w0, w1, [sp, #252]
`
        expect(program).toAssembleTo(expected)
    });


    it('ldp', function () {

        const program = `
ldp x29, x30, [sp], #104
ldp x18, x10, [x20], #-80
ldp x3, x22, [x1], #-512
ldp x9, x10, [x18], #504

ldp w29, w30, [sp], #104
ldp w4, w7, [x0], #0
ldp w9, w18, [x2], #-40
ldp w2, w15, [x0], #-256
ldp w0, w1, [sp], #252


ldp x29, x30, [sp, #104]!
ldp x18, x10, [x11, #-80]!
ldp x3, x22, [x0, #-512]!
ldp x9, x10, [x2, #504]!

ldp w29, w30, [sp, #104]!
ldp w4, w7, [sp, #0]!
ldp w9, w18, [x1, #-40]!
ldp w2, w15, [x30, #-256]!
ldp w0, w1, [x20, #252]!


ldp x29, x30, [sp, #104]
ldp x18, x10, [x0, #-80]
ldp x3, x22, [x1, #-512]
ldp x30, x2, [x4]
ldp x9, x10, [sp, #504]

ldp w29, w30, [sp, #104]
ldp w4, w7, [x0, #0]
ldp w4, w7, [x1]
ldp w9, w18, [x7, #-40]
ldp w2, w15, [sp, #-256]
ldp w0, w1, [sp, #252]
`;

        const expected = `
   3 0000 FDFBC6A8 \tldp x29, x30, [sp], #104
   4 0004 922AFBA8 \tldp x18, x10, [x20], #-80
   5 0008 2358E0A8 \tldp x3, x22, [x1], #-512
   6 000c 49AADFA8 \tldp x9, x10, [x18], #504
   7              \t
   8 0010 FD7BCD28 \tldp w29, w30, [sp], #104
   9 0014 041CC028 \tldp w4, w7, [x0], #0
  10 0018 4948FB28 \tldp w9, w18, [x2], #-40
  11 001c 023CE028 \tldp w2, w15, [x0], #-256
  12 0020 E087DF28 \tldp w0, w1, [sp], #252
  13              \t
  14              \t
  15 0024 FDFBC6A9 \tldp x29, x30, [sp, #104]!
  16 0028 7229FBA9 \tldp x18, x10, [x11, #-80]!
  17 002c 0358E0A9 \tldp x3, x22, [x0, #-512]!
  18 0030 49A8DFA9 \tldp x9, x10, [x2, #504]!
  19              \t
  20 0034 FD7BCD29 \tldp w29, w30, [sp, #104]!
  21 0038 E41FC029 \tldp w4, w7, [sp, #0]!
  22 003c 2948FB29 \tldp w9, w18, [x1, #-40]!
  23 0040 C23FE029 \tldp w2, w15, [x30, #-256]!
  24 0044 8086DF29 \tldp w0, w1, [x20, #252]!
  25              \t
  26              \t
  27 0048 FDFB46A9 \tldp x29, x30, [sp, #104]
  28 004c 12287BA9 \tldp x18, x10, [x0, #-80]
  29 0050 235860A9 \tldp x3, x22, [x1, #-512]
  30 0054 9E0840A9 \tldp x30, x2, [x4]
  31 0058 E9AB5FA9 \tldp x9, x10, [sp, #504]
  32              \t
  33 005c FD7B4D29 \tldp w29, w30, [sp, #104]
  34 0060 041C4029 \tldp w4, w7, [x0, #0]
  35 0064 241C4029 \tldp w4, w7, [x1]
  36 0068 E9487B29 \tldp w9, w18, [x7, #-40]
  37 006c E23F6029 \tldp w2, w15, [sp, #-256]
  38 0070 E0875F29 \tldp w0, w1, [sp, #252]
`
        expect(program).toAssembleTo(expected)
    });


})
