/**
 * Base object for assembler components such.
 * Derived class: Directive, SymbolTable, Instructions
 * @param assembler
 * @constructor
 */
export const Component = function(assembler) {
    /**
     * Throw an assembly error.
     * @param token Token near where error occurred
     * @param code Error code form the AssemblerError object
     * @param args Optional array of arguments to the error.
     * @returns {null}
     */
    this.error = (token, code, args) => {
        return assembler.error(token, code, args);
    }

    /**
     * Throw an assembly error based on an AssemblyError object.
     * @param err Error object already created
     * @returns {null}
     */
    this.errorObj = (err) => {
        return assembler.errorObj(err);
    }
}