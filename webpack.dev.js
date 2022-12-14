const baseConfig = require('./webpack.common');
const { merge } = require('webpack-merge');
const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
    mode: 'development',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, ''),
    },
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, ''),
        },
        port: 9000,
    },
    plugins: [
        new HtmlPlugin({
            filename: 'index.html',
            template: './app/index-template.html',
        }),
        new MiniCssPlugin({
            filename: '[name].css',
        }),
        new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['./app.js', './app.**.js', './index.html'] }),
    ],
});
