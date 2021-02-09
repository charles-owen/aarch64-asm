
// This gets replaced by karma webpack with the updated files on rebuild
var __karmaWebpackManifest__ = [];

// require all modules ending in ".spec" from the
// current directory and all subdirectories
var testsContext = require.context("./test", true, /.spec.js$/);

function inManifest(path) {
    return __karmaWebpackManifest__.indexOf(path) >= 0;
}

var runnable = testsContext.keys().filter(inManifest);

// Run all tests if we didn't find any changes
if (!runnable.length) {
    runnable = testsContext.keys();
}

runnable.forEach(testsContext);