/**
 * Assembler options.
 * @param options User provided options that override the default values.
 * @constructor
 */
export const Options = function(options) {
    options = options ? options : {};

    /// Maximum errors before we abort the assembly
    this.maxErrors = 10;

    ////////////////////////////////////////////////////////////////////////////////////

    for(const property in options) {
        if(options.hasOwnProperty(property)) {
            if(!this.hasOwnProperty(property)) {
                throw new Error("Invalid option " + property);
            }
            this[property] = options[property];
        }
    }

}
