'use strict';
((io) => {
  var client = io();
  client.on('connect', () => {
    console.log('connection');

    client.emit('data', {
      query: 'subscribe',
      module: 'Tasks'
    });

    /*
    client.emit('data', {
      query: 'select',
      module: 'Tasks',
      project: 3
    });
    */
  });

  client.on('response', (data) => {
    console.log(data);
    //console.log(JSON.parse(data));
  });
})(io);
