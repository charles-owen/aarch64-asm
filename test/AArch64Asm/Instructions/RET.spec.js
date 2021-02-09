import {Assembler} from "../../../src/AArch64Asm/Assembler";
import {TestHelper} from "../TestHelper";

describe('RET', function() {
    it('instruction coding', function () {
        const assembler = new Assembler();

        const program = `
main:   ret
        ret x22`;

        //    3 0000 C0035FD6 	    ret
        //    4 0004 C0025FD6 	    ret x22

        assembler.assemble(program);
        const obj = assembler.obj;
        //  console.log(assembler.printer.output);

        const text = obj.getSection('text');

        const data = text.data;

        expect(data).toEqual(TestHelper.wordsToBytes([
            0xC0035FD6, 0xC0025FD6
        ]))
    });

    it('errors', function () {
        const assembler = new Assembler();

        const program = `
main:   ret
        ret w21
        ret x31
        ret sp`;

        assembler.assemble(program);
        const obj = assembler.obj;
        //  console.log(assembler.printer.output);

        const errors = assembler.errors;
        expect(errors.length).toBe(3);
        expect(errors[0].code).toBe('a007');
        expect(errors[1].code).toBe('a011');
        expect(errors[2].code).toBe('a005');
    });
})
