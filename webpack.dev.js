const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    entry: {
        app: './index.js'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        filename: 'aarch64-asm.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'AArch64Asm',
        libraryTarget: 'umd',
        libraryExport: "default",
        publicPath: ''
    },
    devServer: {
        contentBase: './dist',
        hot: true,
        host: 'localhost'
    }
});
