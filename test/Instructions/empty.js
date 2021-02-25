import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('empty', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `

`;

        const expected = `

`
        expect(program).toAssembleTo(expected)
    });

})
