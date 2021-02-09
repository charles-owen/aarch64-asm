/**
 * An assembler target section.
 * @constructor
 */
export const Section = function(name) {
    /// Section name (does not include leading '.'
    this.name = name;

    /// Program counter in the section
    this.pc = 0;

    /// The section binary data
    this.data = [];

    /// Source map from program counter locations
    /// to program line numbers.
    const sourceMap = {};

    const symbols = {}

    /**
     * Add a byte of data to the section
     * @param byte
     */
    this.add = (byte) => {
        this.data.push(byte);
        this.pc++;
    }

    /**
     * Add source mapping. Maps a program counter
     * location in this section to a line in the program.
     * @param line Program line (starting at 1)
     * @param pc Program counter. Optional. If not supposed, use current PC
     */
    this.addSourceMapping = (line, pc) => {
        if(pc === undefined) {
            pc = this.pc;
        }

        sourceMap[pc] = line;
    }

    /**
     * Add a symbol for this section
     * @param name Symbol name
     * @param value Symbol value
     * @param glbl Global?
     */
    this.addSymbol = (name, value, glbl) => {
        symbols[name] = {
            name: name,
            value: value,
            global: glbl
        }
    }

    /**
     * Get a symbol from the section symbol table
     * @param name Name of symbol
     * @returns {*}
     */
    this.getSymbol = (name) => {
        if(symbols.hasOwnProperty(name)) {
            return symbols[name];
        }

        return null;
    }
}