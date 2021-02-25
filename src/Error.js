

export const AssemblerError = function(code, line, char, args) {
    this.code = code;
    this.line = line;
    this.char = char;
    this.args = args !== undefined ? args : [];

    const codes = {
        a001: "Missing operands. Must be Wd, Wn, Wm or Xd, Xn, Xm",
        a002: "Expecting Wd, Wn, Wm or Xd, Xn, Xm",
        a003: "Expected register",
        a004: "Only a 32-bit (W) register is allowed here",
        a005: "The stack register is not allowed here",
        a007: "Only a 64-bit (X) register is allowed here",

        a010: "Expecting Wd, Wn, Wm or Xd, Xn, Xm",
        a011: "Invalid register number {0}. Only values in the range 0-30 are valid",
        a012: "Invalid register name",
        a013: "Expected 32-bit (W) register name here",
        a014: "Expected 64-bit (X) register name here",
        a015: "A zero register is not allowed here",
        a100: "Expected at least three arguments",
        a101: "Expected immediate value",
        a102: "Immediate value cannot exceed 4095",
        a103: "Invalid shift. Only lsl #0 or lsl #12 are valid",
        a104: "Command expected",
        a105: "The extender operations is not valid for this combination of registers",
        a106: "Invalid shift. Can only be 0-4",
        a107: "The stack pointer is not allowed here",
        a108: "Invalid shift format for shifted-register",
        a109: "Invalid shift operation. Must be lsl, lsr, asr",
        a110: "Invalid shift amount. Must be 0-63",
        a111: "Invalid shift amount. Must be 0-31",
        a122: "Unexpected characters following instruction",
        a123: "Expected {0}",
        a124: "Invalid immediate value. Value must be 0 to 65535",
        a125: "Invalid shift. Only lsl #0, lsl #16, lsl #32, or lsl #48 are valid",
        a126: "Invalid shift. Only lsl #0 or lsl #16 are valid",
        a127: "Expected branch address",
        a128: "Invalid immediate value. Must be a valid AArch64 Bitmask value.",
        a129: "Immediate mode is not allowed for the ORN instruction",
        a130: "Invalid shift. Only lsl, lsr, asr, and ror are valid",
        a131: "Invalid immediate value {0}. Must be 0 to 63",
        a132: "Invalid system state register {0}. Must be nzcv",
        a133: "Invalid extend condition. Must be uxtb, uxth, lsl, uxtx, sxtb, sxth, sxtw, sxtx, or lsl",
        a134: "Invalid immediate value. Must be 0 to 31",
        a135: "Invalid immediate value. Must be 0 to 63",
        a136: "Immediate value must be a multiple of 4",
        a137: "Immediate value must be a multiple of 8",
        a138: "Immediate value must be in the range -256 to 252",
        a139: "Immediate value must be in the range -512 to 504",

        a200: "Symbol not defined: {0}",



        a500: "Parse error, expected {0}",

        a800: "Invalid assembler directive {0}",
        a801: ".global directive with no indicated symbol",
        a802: ".global directive incorrectly formed",
        a803: "Expected assembler directive {0}",

        a900: "Maximum errors of {0} exceeded, assembly aborted"
    }

    let message = 'Unknown error';
    if(codes.hasOwnProperty(code)) {
        message = codes[code];
    }


    this.message = () => {
        // Argument substitution
        let msg = message;
        for(const i in args) {
            const res = '{' + i + '}'
            msg = msg.replace(res, args[i]);
        }

        return "Error[" + line + "," + char + "]: " + code + " " + msg
    }

   //console.log(this.message());

}