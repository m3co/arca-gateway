const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'babel-polyfill',
        'webpack-hot-middleware/client',
        './src/client'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src/')
        },
        extensions: ['.js']
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, "node_modules"),
                ],
                loaders: ["babel-loader","eslint-loader"]
            }
        ]
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
};
