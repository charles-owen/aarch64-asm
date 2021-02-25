import {AssemblyValidator} from "./Instructions/Matchers/AssemblyValidator";

describe('Directives', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('error a800', function () {

        const program = `
    .bad
`;

        const expected = ``

        expect(program).toHaveErrors(['a800'])
    });

})
