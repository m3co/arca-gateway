'use strict';
((io) => {
  var client = io('http://localhost:9000');
  client.on('connect', () => {
    console.log('connection');

    var e = {
      query: 'subscribe',
      module: 'Supplies'
    };
    client.emit('data', e);
  });
})(io);
