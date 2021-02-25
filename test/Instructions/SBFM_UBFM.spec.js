import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('empty', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `
ubfm x7, x3, #5, #63
ubfm x9, x22, #41, #40
                       
ubfm w3, w0, #7, #31
ubfm w6, w22, #9, #8


sbfm x7, x3, #5, #63
sbfm x9, x22, #41, #40
                       
sbfm w3, w0, #7, #31
sbfm w6, w22, #9, #8
`;

        const expected = `
   3 0000 67FC45D3  ubfm x7, x3, #5, #63
   4 0004 C9A269D3  ubfm x9, x22, #41, #40
   5                                      
   6 0008 037C0753  ubfm w3, w0, #7, #31
   7 000c C6220953  ubfm w6, w22, #9, #8
   8               
   9               
  10 0010 67FC4593  sbfm x7, x3, #5, #63
  11 0014 C9A26993  sbfm x9, x22, #41, #40
  12                                      
  13 0018 037C0713  sbfm w3, w0, #7, #31
  14 001c C6220913  sbfm w6, w22, #9, #8
`
        expect(program).toAssembleTo(expected)
    });

})
