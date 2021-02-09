
import {Assembler} from '../../src/AArch64Asm/Assembler';
import {Lexer} from "../../src/AArch64Asm/Lexer";

describe('Assembler', function() {
    it('Construct', function() {
        const assembler = new Assembler();
    });

    it('One line program', function() {
        const assembler = new Assembler();

        const program = `
main:   adc x1, x2, x3`;

        /*
           3 0000 4100039A 	main:   adc x1, x2, x3
        DEFINED SYMBOLS
                       asm.S:3      .text:0000000000000000 main
                       asm.S:3      .text:0000000000000000 $x
        */

        assembler.assemble(program);
        const obj = assembler.obj;
        const text = obj.getSection('text');

        const data = text.data;
        expect(data.length).toBe(4);
        expect(data[0]).toBe(0x41);
        expect(data[1]).toBe(0x00);
        expect(data[2]).toBe(0x03);
        expect(data[3]).toBe(0x9a);
    });

    it('W registers program', function() {
        const assembler = new Assembler();

        const program = `
main:   adc w3, w7, wzr`;

        // 3 0000 E3001F1A 	main:   adc w3, w7, wzr

        assembler.assemble(program);
        const obj = assembler.obj;
        const text = obj.getSection('text');

        const data = text.data;
        expect(data.length).toBe(4);
        expect(data[0]).toBe(0xe3);
        expect(data[1]).toBe(0x00);
        expect(data[2]).toBe(0x1f);
        expect(data[3]).toBe(0x1a);
    });

    it('add', function() {
        const assembler = new Assembler();

        const program = `
main:   add x1, x2, #1300
        add w1, w2, #99
        add w5, w7, #99, lsl #12
        
        add x1, x3, w7, uxtb
        add x1, x3, w7, uxth
        add w4, w7, w19, sxtb
        
        add x1, x9, x21
        add w3, w30, wzr
        add x12, xzr, x0, lsl #20
        add w3, wzr, w3, lsr #10
        add w3, wzr, w3, asr #31`;

        // 3 0000 41501491 	add x1, x2, #1300
        // 4 0004 418C0111 	add  w1, w2, #99
        // 5 0008 E58C4111 	add w5, w7, #99, lsl #12
        // 6
        // 7 000c 6100278B 	add x1, x3, w7, uxtb
        // 8 0010 6120278B 	add x1, x3, w7, uxth
        // 9 0014 E480330B 	add w4, w7, w19, sxtb
        //
        // 10 0018 2101158B          add x1, x9, x21
        // 11 001C C3031F0B          add w3, w30, wzr
        // 12 0020 EC53008B          add x12, xzr, x0, lsl #20
        // 13 0024 E32B430B          add w3, wzr, w3, lsr #10
        // 14 0028 E37F830B          add w3, wzr, w3, asr #31

        assembler.assemble(program);
        const obj = assembler.obj;
        const text = obj.getSection('text');

        const data = text.data;
        expect(data.length).toBe(44);
        expect(data[0]).toBe(0x41);
        expect(data[1]).toBe(0x50);
        expect(data[2]).toBe(0x14);
        expect(data[3]).toBe(0x91);

        expect(data).toEqual([
            0x41, 0x50, 0x14, 0x91,
            0x41, 0x8C, 0x01, 0x11,
            0xE5, 0x8C, 0x41, 0x11,
            0x61, 0x00, 0x27, 0x8b,
            0x61, 0x20, 0x27, 0x8B,
            0xE4, 0x80, 0x33, 0x0B,
            0x21, 0x01, 0x15, 0x8B,
            0xC3, 0x03, 0x1F, 0x0B,
            0xEC, 0x53, 0x00, 0x8B,
            0xE3, 0x2B, 0x43, 0x0B,
            0xE3, 0x7F, 0x83, 0x0B
        ])
    });

    it('adc, sbc, adcs, sbcs, w and x registers program', function() {
        const assembler = new Assembler();

        const program = `
main:
    adc x1, x2, x3
    adc w5, w3, w7
    adcs x2, x3, x30
    adcs w3, wzr, wzr

    sbc x1, x2, x3
    sbc w5, w3, w7
    sbcs x2, x3, x26
    sbcs w3, wzr, wzr`;

    // 3              	main:
    // 4 0000 4100039A 	    adc x1, x2, x3
    // 5 0004 6500071A 	    adc w5, w3, w7
    // 6 0008 62001EBA 	    adcs x2, x3, x30
    // 7 000c E3031F3A 	    adcs w3, wzr, wzr
    // 8
    // 9 0010 410003DA 	    sbc x1, x2, x3
    // 10 0014 6500075A 	    sbc w5, w3, w7
    // 11 0018 62001AFA 	    sbcs x2, x3, x26
    // 12 001c E3031F7A 	    sbcs w3, wzr, wzr

        assembler.assemble(program);
        const obj = assembler.obj;
        const text = obj.getSection('text');

        const data = text.data;
        expect(data.length).toBe(32);
        const expected = [0x4100039A, 0x6500071A, 0x62001EBA, 0xE3031F3A,
            0x410003DA, 0x6500075A, 0x62001AFA, 0xE3031F7A];

        let address = 0;
        for(let ex of expected) {
            for(let i=0; i<4; i++) {
                expect(data[address]).toBe((ex >> 24) & 0xff);
                ex <<= 8;
                address++;
            }
        }
    });

    it('first asm program', function() {
        const assembler = new Assembler();

        const program = `// 
// Simple program that adds four numbers
//
 
.text

.global add4


add4:
    add x2, x2, x3  // x2 = x2 + x3
    add x0, x0, x1  // x0 = x0 + x1
    add x0, x0, x2  // x0 = x0 + x2

    ret     // return`;

        // 2              	// Simple program that adds four numbers
        // 3              	//
        // 4
        // 5              	.text
        // 6
        // 7              	.global add4
        // 8
        // 9
        // 10              	add4:
        // 11 0000 4200038B 	    add x2, x2, x3  // x2 = x2 + x3
        // 12 0004 0000018B 	    add x0, x0, x1  // x0 = x0 + x1
        // 13 0008 0000028B 	    add x0, x0, x2  // x0 = x0 + x2
        // 14
        // 15 000c C0035FD6 	    ret     // return

        assembler.assemble(program);
        const obj = assembler.obj;
        //console.log(assembler.printer.output);

        const text = obj.getSection('text');

        const data = text.data;

        expect(data).toEqual(wordsToBytes([
            0x4200038B, 0x0000018B, 0x0000028B, 0xC0035FD6
        ]))

        const add4 = text.getSymbol('add4');
        expect(add4).not.toBeNull();
        expect(add4.global).toBeTrue();

    });

// //
// // Simple program that adds four numbers
// //
//
// .text
//
//         .global add4
//
//
// add4:
//         add x2, x2, x3  // x2 = x2 + x3
//         add x0, x0, x1  // x0 = x0 + x1
//         add x0, x0, x2  // x0 = x0 + x2
//
//         ret     // return

    const wordsToBytes = function(words) {
        let bytes = [];
        for(let ex of words) {
            for(let i=0; i<4; i++) {
                bytes.push((ex >> 24) & 0xff);
                ex <<= 8;
            }
        }

        return bytes;
    }
});

