import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('AND/ORR/ORN', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding (small test)', function () {

        const program = `
and w0, wzr, #2
`;

        const expected = `
   3 0000 E0031F12 and w0, wzr, #2
`
        expect(program).toAssembleTo(expected)
    });

    it('immediate', function () {

        const program = `
orr w0, wzr, #2
orr w9, w3, #0x3ff
orr wsp, w0, #0xe1e1e1e1

orr x1, x3, #6
orr sp, x8, #0x1000100010001000
orr x23, x30, #0b100000

and w0, wzr, #2
and w9, w3, #0x3ff
and wsp, w0, #0xe1e1e1e1

and x1, x3, #6
and sp, x8, #0x1000100010001000
and x23, x30, #0b100000

ands w0, wzr, #2
ands w9, w3, #0x3ff

ands x1, x3, #6
ands x2, xzr, #0x1000100010001000

`;

        const expected = `
   2 0000 E0031F32 \torr w0, wzr, #2
   3 0004 69240032 \torr w9, w3, #0x3ff
   4 0008 1FCC0332 \torr wsp, w0, #0xe1e1e1e1
   5              \t
   6 000c 61047FB2 \torr x1, x3, #6
   7 0010 1F8104B2 \torr sp, x8, #0x1000100010001000
   8 0014 D7037BB2 \torr x23, x30, #0b100000
   9              \t
  10 0018 E0031F12 and w0, wzr, #2
  11 001c 69240012 \tand w9, w3, #0x3ff
  12 0020 1FCC0312 \tand wsp, w0, #0xe1e1e1e1
  13              \t
  14 0024 61047F92 \tand x1, x3, #6
  15 0028 1F810492 \tand sp, x8, #0x1000100010001000
  16 002c D7037B92 \tand x23, x30, #0b100000
  17              \t
  18 0030 E0031F72 ands w0, wzr, #2
  19 0034 69240072 \tands w9, w3, #0x3ff
  20              \t
  21 0038 61047FF2 \tands x1, x3, #6
  22 003c E28304F2 \tands x2, xzr, #0x1000100010001000
`
        expect(program).toAssembleTo(expected)
    });


    it('shifted register', function () {

        const program = `

orr x0, x1, x2
orr x3, xzr, x4
orr x9, x3, x2, lsl #4

orr w1, w2, w7
orr w0, wzr, w0
orr w6, w19, w0, lsl #30

and x0, x1, x2
and x3, xzr, x4
and x9, x3, x2, lsl #4

and w1, w2, w7
and w0, wzr, w0
and w6, w19, w0, lsl #30

ands x0, x1, x2
ands x3, xzr, x4
ands x9, x3, x2, lsl #4

ands w1, w2, w7
ands w0, wzr, w0
ands w6, w19, w0, lsl #30

`;

        const expected = `
   2 0000 200002AA \torr x0, x1, x2
   3 0004 E30304AA \torr x3, xzr, x4
   4 0008 691002AA \torr x9, x3, x2, lsl #4
   5              \t
   6 000c 4100072A \torr w1, w2, w7
   7 0010 E003002A \torr w0, wzr, w0
   8 0014 667A002A \torr w6, w19, w0, lsl #30
   9              \t
  10 0018 2000028A \tand x0, x1, x2
  11 001c E303048A \tand x3, xzr, x4
  12 0020 6910028A \tand x9, x3, x2, lsl #4
  13              \t
  14 0024 4100070A \tand w1, w2, w7
  15 0028 E003000A \tand w0, wzr, w0
  16 002c 667A000A \tand w6, w19, w0, lsl #30
  17              \t
  18 0030 200002EA \tands x0, x1, x2
  19 0034 E30304EA \tands x3, xzr, x4
  20 0038 691002EA \tands x9, x3, x2, lsl #4
  21              \t
  22 003c 4100076A \tands w1, w2, w7
  23 0040 E003006A \tands w0, wzr, w0
  24 0044 667A006A \tands w6, w19, w0, lsl #30
`
        expect(program).toAssembleTo(expected)
    });

    it('small', function () {

        const program = `
eor x9, x3, x2, lsl #4
eor x23, x30, #0b100000

`;

        const expected = `
   2 0000 691002CA \teor x9, x3, x2, lsl #4
   3 0004 D7037BD2 \teor x23, x30, #0b100000

`
        expect(program).toAssembleTo(expected)
    });



})
