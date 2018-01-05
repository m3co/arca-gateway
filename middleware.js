
var express = require('express');
var proxy = require('http-proxy-middleware');
var app = express();

var wsProxy = proxy('/socket.io', {
  target:'http://localhost:9000',
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
var server = app.listen(1133);
server.on('upgrade', wsProxy.upgrade);
