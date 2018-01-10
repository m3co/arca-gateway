const express = require('express');
const proxy = require('http-proxy-middleware');
const app = express();

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config');

const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

const wsProxy = proxy('/socket.io', {
  target:'http://x12.m3c.space',
  ws:true,
  logLevel: 'debug',
  changeOrigin:true
});

app.use(wsProxy);
app.use('/socket.io', wsProxy);
app.use('/', proxy({
  target: 'http://localhost:9001',
  changeOrigin: true,
  logLevel: 'debug',
  secure: false,
  xfwd: true
}));


console.log('Listening to http://localhost:1133');
const server = app.listen(1133);
server.on('upgrade', wsProxy.upgrade);
