'use strict';
((io) => {
  var client = io();
  client.on('connect', () => {
    console.log('connection');

    client.emit('data', {
      query: 'subscribe',
      module: 'fnCostTasks1'
    });

    client.emit('data', {
      query: 'select',
      module: 'fnCostTasks1',
      project: 11
    });
  });

  client.on('response', (data) => {
    console.log(data);
    //console.log(JSON.parse(data));
  });
})(io);
