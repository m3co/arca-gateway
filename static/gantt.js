'use strict';
((io) => {
  var client = io();
  var gantt = window.gantt;
  var connected = false;
  client.on('connect', () => {
    console.log('connection');
    if (!connected) {
      connected = true;
      client.emit('data', {
        query: 'subscribe',
        module: 'viewAPUTasks'
      });

      client.emit('data', {
        query: 'get-edges',
        module: 'viewAPUTasks',
        project: 3
      });
    }
  });

  gantt.update = function(row) {
    var event = {
      query: 'update',
      module: 'Tasks',
      from: 'Tasks',
      id: row.id,
      idkey: 'id',
      key: ['start', 'end'],
      value: [row.start.toISOString(), row.end.toISOString()]
    };
    client.emit('data', event);
  }
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
        data.row.start = null;
        data.row.end = null;
      } else {
        data.row.start = new Date(data.row.start);
        data.row.end = new Date(data.row.end);
      }
      data.row.description = '';
      gantt.doselect(data.row);
    }
    if (data.query == 'update') {
      if (data.row.expand) {
        return;
      }
      data.row.start = new Date(data.row.start);
      data.row.end = new Date(data.row.end);
      gantt.doupdate(data.row);
    }
    if (data.query == 'delete') {
      gantt.dodelete(data.row);
    }
  });
})(io);
