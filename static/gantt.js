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

  var gantt = window.gantt;
  client.on('response', (data) => {
    if (data.query == 'get-edges') {
      data.row.start = new Date(data.row.start);
      data.row.end = new Date(data.row.end);

      gantt.init(data.row);
      client.emit('data', {
        query: 'select',
        module: 'Tasks',
        project: 3
      });
    }
    if (data.query == 'select') {
      if (data.row.expand) {
        delete data.row.start;
        delete data.row.end;
      } else {
        data.row.start = new Date(data.row.start);
        data.row.end = new Date(data.row.end);
      }
      data.row.description = '';
      gantt.doselect(data.row);
    }
  });
})(io);
