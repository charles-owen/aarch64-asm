import {AssemblyValidator} from "./Matchers/AssemblyValidator";

describe('RET', function() {
    beforeEach(function(){
        jasmine.addMatchers(AssemblyValidator);
    })

    it('instruction coding', function () {

        const program = `
.text

main:   ret
        ret x22
`;

        const expected = `
   3              	.text
   4              	
   5 0000 C0035FD6 	main:   ret
   6 0004 C0025FD6 	        ret x22
`
        expect(program).toAssembleTo(expected)
    });

    it('errors', function () {

        const program = `
main:   ret
        ret w21
        ret x31
        ret sp`;

        expect(program).toHaveErrors(['a500', 'a011', 'a107']);
    });
})
