import {Assembler} from "../../src/Assembler";
import {TestHelper} from "../TestHelper";

describe('NOP', function() {
    it('instruction coding', function () {
        const assembler = new Assembler();

        const program = `
main:   nop`;

        //    3 0000 1F2003D5 	     nop

        assembler.assemble(program);
        const obj = assembler.obj;
        // console.log(assembler.printer.output);

        const text = obj.getSection('text');

        const data = text.data;

        expect(data).toEqual(TestHelper.wordsToBytes([
            0x1F2003D5
        ]))
    });
})