/**
 * Symbol table entry.
 * @constructor
 */
export const Symbol = function(name, value, section, line, char, pass) {
    this.name = name;
    this.value = value;
    this.section = section;
    this.line = line;
    this.char = char;
    this.global = false;
    this.pass = pass
}