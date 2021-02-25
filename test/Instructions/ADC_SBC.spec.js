import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('ADC/SBC/ADCS/SBCS', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `
main:
    adc x1, x2, x3
    adc w5, w3, w7
    adcs x2, x3, x30
    adcs w3, wzr, wzr

    sbc x1, x2, x3
    sbc w5, w3, w7
    sbcs x2, x3, x26
    sbcs w3, wzr, wzr
`;

        const expected = `
   3              	main:
   4 0000 4100039A 	    adc x1, x2, x3
   5 0004 6500071A 	    adc w5, w3, w7
   6 0008 62001EBA 	    adcs x2, x3, x30
   7 000c E3031F3A 	    adcs w3, wzr, wzr
   8              	
   9 0010 410003DA 	    sbc x1, x2, x3
  10 0014 6500075A 	    sbc w5, w3, w7
  11 0018 62001AFA 	    sbcs x2, x3, x26
  12 001c E3031F7A 	    sbcs w3, wzr, wzr
`
        expect(program).toAssembleTo(expected)
    });

})
