import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('empty', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `
mrs x3, nzcv
msr nzcv, x7
`;

        const expected = `
   2 0000 03423BD5 mrs x3, nzcv
   3 0004 07421BD5 msr nzcv, x7
`
        expect(program).toAssembleTo(expected)
    });

})
