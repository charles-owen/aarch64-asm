import {Instructions} from "../Instructions";


export const ORN_BIC_EON = function(assembler) {
    Instructions.call(this, assembler);

    /**
     * Converts instruction into code.
     * @param line
     * @returns {boolean}
     */
    this.try = (line) => {
        switch(line[0].value) {

            case 'orn':
                this.shiftedRegister(line, 0b01, false,true)
                break;

            case 'bic':
                this.shiftedRegister(line, 0b00, false,true)
                break;

            case 'bics':
                this.shiftedRegister(line, 0b11, false,true)
                break;

            case 'eon':
                this.shiftedRegister(line, 0b10, false,true)
                break;

            default:
                return false;
        }

        return true;
    }

}


ORN_BIC_EON.prototype = Object.create(Instructions.prototype);
ORN_BIC_EON.prototype.constructor = ORN_BIC_EON;