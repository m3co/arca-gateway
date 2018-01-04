'use strict';
var net = require('net');
var client = new net.Socket();

client.connect(12345, 'localhost', () => {
  console.log('connect');
  var e = {
    query: 'subscribe',
    module: 'Supplies'
  };
  client.write(JSON.stringify(e));
  client.write('\n');
});


client.on('data', data => {
  console.log('data' + data);
});


client.on('close', () => {
  console.log('close');
});
