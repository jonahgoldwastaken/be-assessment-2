const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
require('dotenv').config()

module.exports = {
    entry: './src/bundler.js',
    output: {
        path: path.resolve(__dirname, 'assets'),
        filename: 'app.bundle.js',
        publicPath: '/assets/'
    },
    target: 'web',
    devtool: process.env.NODE_ENV == 'development' ? 'eval' : 'source-maps',
    mode: process.env.NODE_ENV,
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
                test: /\.scss/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            minimize: process.env.NODE_ENV != 'development'
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }]
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('app.css'),
        new webpack.WatchIgnorePlugin([
            /index.js/,
            /views/,
            /db/,
            /node_modules/,
            /assets/,
            /.vscode/
        ])
    ]
}