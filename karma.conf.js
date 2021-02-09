const webpackConfig = require('./webpack.karma.js');
const path = require('path');

//
// Karma configuration
//

module.exports = function (config) {
    config.set({
        webpack: webpackConfig,
        frameworks: ['jasmine', 'webpack'], // 'source-map-support',
        files: [
            'all.karma.js'
        ],
        preprocessors: {
            'all.karma.js': ['webpack', 'sourcemap']
        },
     //   reporters: ['progress'],

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        //logLevel: config.LOG_DEBUG,

        autoWatch: true,
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
        basePath: path.resolve(__dirname)
    })
}
