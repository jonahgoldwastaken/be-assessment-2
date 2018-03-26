/* eslint-disable no-unused-vars */
const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
require('dotenv').config()

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'assets'),
        filename: 'app.bundle.js',
        publicPath: '/assets/'
    },
    target: 'web',
    devtool: process.env.APP_ENV == 'dev' ? 'eval' : 'source-maps',
    mode: process.env.APP_ENV == 'dev' ? 'development' : 'production',
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: {
                                        browsers: ['ie > 10']
                                    }
                                }]
                            ]
                        }
                    },
                    {
                        loader: 'eslint-loader',
                        options: {
                            fix: true,
                            failOnError: true
                        }
                    }
                ]
            },
            {
                test: /\.css/,
                use: ExtractTextPlugin.extract({
                    use: {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            minimize: process.env.APP_ENV != 'dev'
                        }
                    }
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('app.css')
    ]
}