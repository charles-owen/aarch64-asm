import {Symbol} from "./Symbol";

/**
 * The assembler symbol table
 * @constructor
 */
export const SymbolTable = function() {

    const symbols = {};

    this.set = (name, value, section, line, char) => {
        if(!symbols.hasOwnProperty(name)) {
            symbols[name] = new Symbol(name, value, section, line, char);
        }

        const symbol = symbols[name];
        symbol.value = value;
        symbol.section = section;

        return symbol;
    }

    this.get = (name) => {
        if(symbols.hasOwnProperty(name)) {
            return symbols[name];
        }

        return null;
    }

    /**
     * Write the contents of this symbol table to an
     * ElfObj object file object
     * @param obj Object of type ElfObj
     */
    this.toElf = (obj) => {
        for(const name in symbols) {
            const symbol = symbols[name];
            const section = obj.getSection(symbol.section);
            if(section !== null) {
                section.addSymbol(symbol.name, symbol.value, symbol.global);
            }
        }
    }
}