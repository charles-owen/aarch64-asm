

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
        a200: "Symbol not defined: {0}",
        a401: ".global directive with no indicated symbol",
        a402: ".global directive incorrectly formed",

        a900: "Maximum errors of {0} exceeded, assembly aborted"
    }

    let message = 'Unknown error';
    if(codes.hasOwnProperty(code)) {
        message = codes[code];
    }

    console.log("Error[" + line + "," + char + "]: " + code + " " + message);

}