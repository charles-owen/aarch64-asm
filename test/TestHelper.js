/**
 * Test helper functions.
 * @constructor
 */
export const TestHelper = function() {

}

/**
 * Convert an array of 32-bit words to an array of
 * bytes. Little-endian.
 * @param words Array or words
 * @returns {Array} Result
 */
TestHelper.wordsToBytes = function(words) {
    let bytes = [];
    for(let ex of words) {
        for(let i=0; i<4; i++) {
            bytes.push((ex >> 24) & 0xff);
            ex <<= 8;
        }
    }

    return bytes;
}

TestHelper.toHex = function(value, len) {
    let hex = value.toString(16);
    while(hex.length < len) {
        hex = '0' + hex;
    }

    return hex.toUpperCase()
}