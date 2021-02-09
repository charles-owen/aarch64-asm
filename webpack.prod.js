const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = merge(common, {
    mode: 'production',
    entry: {
        app: './index.js'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true  // Must be set to true if using source-maps in production
            })
        ]
    },
    performance: {
        maxEntrypointSize: 500000,
        maxAssetSize: 500000
    },
    output: {
        filename: 'aarch64-asm.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'AArch64Asm',
        libraryTarget: 'umd',
        libraryExport: "default",
        publicPath: ''
    },
});
