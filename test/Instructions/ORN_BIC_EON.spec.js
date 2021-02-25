import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('AND/ORR/ORN', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('shifted register', function () {

        const program = `
orn x0, x1, x2
orn x3, xzr, x4
orn x9, x3, x2, lsl #4

orn w1, w2, w7
orn w0, wzr, w0
orn w6, w19, w0, lsl #30

bic x0, x1, x2
bic x3, xzr, x4
bic x9, x3, x2, lsl #4

bic w1, w2, w7
bic w0, wzr, w0
bic w6, w19, w0, lsl #30

bics x0, x1, x2
bics x3, xzr, x4
bics x9, x3, x2, lsl #4

bics w1, w2, w7
bics w0, wzr, w0
bics w6, w19, w0, lsl #30

eon x0, x1, x2
eon x3, xzr, x4
eon x9, x3, x2, lsl #4

eon w1, w2, w7
eon w0, wzr, w0
eon w6, w19, w0, lsl #30

`;

        const expected = `
  2 0000 200022AA \torn x0, x1, x2
   3 0004 E30324AA \torn x3, xzr, x4
   4 0008 691022AA \torn x9, x3, x2, lsl #4
   5              \t
   6 000c 4100272A \torn w1, w2, w7
   7 0010 E003202A \torn w0, wzr, w0
   8 0014 667A202A \torn w6, w19, w0, lsl #30
   9              \t
  10 0018 2000228A \tbic x0, x1, x2
  11 001c E303248A \tbic x3, xzr, x4
  12 0020 6910228A \tbic x9, x3, x2, lsl #4
  13              \t
  14 0024 4100270A \tbic w1, w2, w7
  15 0028 E003200A \tbic w0, wzr, w0
  16 002c 667A200A \tbic w6, w19, w0, lsl #30
  17              \t
  18 0030 200022EA \tbics x0, x1, x2
  19 0034 E30324EA \tbics x3, xzr, x4
  20 0038 691022EA \tbics x9, x3, x2, lsl #4
  21              \t
  22 003c 4100276A \tbics w1, w2, w7
  23 0040 E003206A \tbics w0, wzr, w0
  24 0044 667A206A \tbics w6, w19, w0, lsl #30
  25              \t
  26 0048 200022CA \teon x0, x1, x2
  27 004c E30324CA \teon x3, xzr, x4
  28 0050 691022CA \teon x9, x3, x2, lsl #4
  29              \t
  30 0054 4100274A \teon w1, w2, w7
  31 0058 E003204A \teon w0, wzr, w0
  32 005c 667A204A \teon w6, w19, w0, lsl #30

`
        expect(program).toAssembleTo(expected)
    });


})
