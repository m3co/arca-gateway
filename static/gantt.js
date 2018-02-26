'use strict';
((io) => {
  var client = io();
  client.on('connect', () => {
    console.log('connection');

    client.emit('data', {
      query: 'subscribe',
      module: 'Tasks'
    });

    client.emit('data', {
      query: 'get-edges',
      module: 'Tasks',
      project: 3
    });
  });

  client.on('response', (data) => {
    console.log(data);

    if (data.query == 'get-edges') {
      var gantt = window.gantt;
      data.row.start = new Date(data.row.start);
      data.row.end = new Date(data.row.end);

      gantt.init(data.row);
      client.emit('data', {
        query: 'select',
        module: 'Tasks',
        project: 3
      });
    }
  });
})(io);
