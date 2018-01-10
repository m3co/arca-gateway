var express = require('express');
var proxy = require('http-proxy-middleware');
var app = express();
var webpack = require('webpack');
var config = require('./webpack.config.dev');

var compiler = webpack(config);

var wsProxy = proxy('/socket.io', {
  target:'http://x12.m3c.space',
  ws:true,
  logLevel: 'debug',
  changeOrigin:true
});


app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

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
var server = app.listen(1133);
server.on('upgrade', wsProxy.upgrade);