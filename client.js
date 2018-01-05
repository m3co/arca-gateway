'use strict';
((io) => {
  var client = io('http://localhost:9000');
  client.on('connect', () => {
    console.log('connection');

    var e = {
      query: 'select',
      from: 'Supplies',
      module: 'Supplies'
    };
    client.emit('data', e);
  });

  client.on('response', (data) => {
    console.log(data);
    //console.log(JSON.parse(data));
  });
})(io);
