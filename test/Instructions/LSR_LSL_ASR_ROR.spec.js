import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('empty', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `

lsr x7, x3, #1
lsr x9, x22, #0
lsr x7, x3, #31
          \t         \t    
lsr w3, w0, #1
lsr w6, w22, #0
lsr w9, w30, #31

lsrv x7, x3, x7
lsr x9, x22,x2
 
lsrv w3, w0, w7
lsr w6, w22, w25

lsl x7, x3, #1
lsl x9, x22, #0
lsl x7, x3, #31
          \t         \t    
lsl w3, w0, #1
lsl w6, w22, #0
lsl w9, w30, #31

lsl x7, x3, x7
lsl x9, x22,x2
       \t    
lsl w3, w0, w7
lsl w6, w22, w25

asr x7, x3, #1
asr x9, x22, #0
asr x7, x3, #31
          \t         \t    
asr w3, w0, #1
asr w6, w22, #0
asr w9, w30, #31

asr x7, x3, x7
asr x9, x22,x2
        \t    
asr w3, w0, w7
asr w6, w22, w25

asr x7, x3, #1
asr x9, x22, #0
asr x7, x3, #31
\t         \t    
ror w3, w0, #1
ror  w6, w22, #0
ror w9, w30, #31

ror x7, x3, x7
ror x9, x22,x2
\t    
ror w3, w0, w7
ror w6, w22, w25



`;

        const expected = `
   2 0000 67FC41D3 \tlsr x7, x3, #1
   3 0004 C9FE40D3 \tlsr x9, x22, #0
   4 0008 67FC5FD3 \tlsr x7, x3, #31
   5              \t          \t         \t    
   6 000c 037C0153 \tlsr w3, w0, #1
   7 0010 C67E0053 \tlsr w6, w22, #0
   8 0014 C97F1F53 \tlsr w9, w30, #31
   9              \t
  10 0018 6724C79A \tlsr x7, x3, x7
  11 001c C926C29A \tlsr x9, x22,x2
  12              \t        \t    
  13 0020 0324C71A \tlsr w3, w0, w7
  14 0024 C626D91A \tlsr w6, w22, w25
  15              \t
  16 0028 67F87FD3 \tlsl x7, x3, #1
  17 002c C9FE40D3 \tlsl x9, x22, #0
  18 0030 678061D3 \tlsl x7, x3, #31
  19              \t          \t         \t    
  20 0034 03781F53 \tlsl w3, w0, #1
  21 0038 C67E0053 \tlsl w6, w22, #0
  22 003c C9030153 \tlsl w9, w30, #31
  23              \t
  24 0040 6720C79A \tlsl x7, x3, x7
  25 0044 C922C29A \tlsl x9, x22,x2
  26              \t       \t    
  27 0048 0320C71A \tlsl w3, w0, w7
  28 004c C622D91A \tlsl w6, w22, w25
  29              \t
  30 0050 67FC4193 \tasr x7, x3, #1
  31 0054 C9FE4093 \tasr x9, x22, #0
  32 0058 67FC5F93 \tasr x7, x3, #31
  33              \t          \t         \t    
  34 005c 037C0113 \tasr w3, w0, #1
  35 0060 C67E0013 \tasr w6, w22, #0
  36 0064 C97F1F13 \tasr w9, w30, #31
  37              \t
  38 0068 6728C79A \tasr x7, x3, x7
  39 006c C92AC29A \tasr x9, x22,x2
  40              \t        \t    
  41 0070 0328C71A \tasr w3, w0, w7
  42 0074 C62AD91A \tasr w6, w22, w25
  43              \t
  44 0078 67FC4193 \tasr x7, x3, #1
  45 007c C9FE4093 \tasr x9, x22, #0
  46 0080 67FC5F93 \tasr x7, x3, #31
  47              \t\t         \t    
  48 0084 03048013 \tror w3, w0, #1
  49 0088 C6029613 \tror  w6, w22, #0
  50 008c C97F9E13 \tror w9, w30, #31
  51              \t
  52 0090 672CC79A \tror x7, x3, x7
  53 0094 C92EC29A \tror x9, x22,x2
  54              \t\t    
  55 0098 032CC71A \tror w3, w0, w7
  56 009c C62ED91A \tror w6, w22, w25
  
`
        expect(program).toAssembleTo(expected)
    });

})
