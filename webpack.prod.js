const baseConfig = require('./webpack.common');
const { merge } = require('webpack-merge');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(baseConfig, {
    mode: 'production',
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, ''),
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './app/index-template.html',
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
            },
        }),
        new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['./app.*', './app.**.*', './index.html'] }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
        }),
    ],
});
