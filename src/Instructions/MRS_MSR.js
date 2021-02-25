import {Instructions} from "../Instructions";

export const MRS_MSR = function(assembler) {
    Instructions.call(this, assembler);

    this.parser.pattern('"msr" "nzcv", <Xt>', (results)=> {
        this.addWord(0xd51b4200 |
            results.Rt)
    })

    this.parser.pattern('"mrs" <Xt>, "nzcv"', (results)=> {
        this.addWord(0xd51b4200 |
            (1 << 21) |     // L=1
            results.Rt)
    })

    /**
     * MRS and MSR instructions
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        switch(line[0].value) {
            case 'msr':
            case 'mrs':
                this.parser.parse(line);
                break;

            default:
                return false;
        }

        return true;
    }
}

MRS_MSR.prototype = Object.create(Instructions.prototype);
MRS_MSR.prototype.constructor = MRS_MSR;