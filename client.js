'use strict';
((io) => {
  var client = io('http://localhost:9000');
  client.on('connect', () => {
    console.log('connection');
    client.emit('data', 'lets send this');
  });
})(io);
