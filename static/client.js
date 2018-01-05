'use strict';
((io) => {
  var client = io('http://x12.m3c.space:9000');
  client.on('connect', () => {
    console.log('connection');

    client.emit('data', {
      query: 'subscribe',
      module: 'fnCostTasks1'
    });

    client.emit('data', {
      query: 'select',
      module: 'fnCostTasks1',
      project: 5
    });
  });

  client.on('response', (data) => {
    console.log(data);
    //console.log(JSON.parse(data));
  });
})(io);
