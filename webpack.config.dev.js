const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
    filename: "app.bundle.css",
    allChunks: true
});

// ▒▒▒░░░░░░░░░░▄▐░░░░
// ▒░░░░░░▄▄▄░░▄██▄░░░
// ░░░░░░▐▀█▀▌░░░░▀█▄░
// ░░░░░░▐█▄█▌░░░░░░▀█▄
// ░░░░░░░▀▄▀░░░▄▄▄▄▄▀▀
// ░░░░░▄▄▄██▀▀▀▀░░░░░
// ░░░░█▀▄▄▄█░▀▀░░░░░░
// ░░░░▌░▄▄▄▐▌▀▀▀░░░░░
// ░▄░▐░░░▄▄░█░▀▀░░░░░
// ░▀█▌░░░▄░▀█▀░▀░░░░░
// ░░░░░░░░▄▄▐▌▄▄░░░░░
// ░░░░░░░░▀███▀█░▄░░░
// ░░░░░░░▐▌▀▄▀▄▀▐▄░░░
// ░░░░░░░▐▀░░░░░░▐▌░░
// ░░░░░░░█░░░░░░░░█░░
// ░░░░░░▐▌░░░░░░░░░█░ 


module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'babel-polyfill',
        'webpack-hot-middleware/client',
        './static/arca',
        path.resolve(__dirname, 'static') + '/styles/app.scss'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    resolve: {
        alias: {
            static: path.resolve(__dirname, 'static/')
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
            },
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [{
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    }, {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            includePaths: [
                                path.join(__dirname, 'static')
                            ]
                        }
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|gif|mp4|jpg)$/,
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        extractSass
    ]
};
