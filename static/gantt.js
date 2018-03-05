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
      module: 'viewAPUTasks',
      from: 'viewAPUTasks',
      id: row.id,
      idkey: 'id',
      key: ['Tasks_start', 'Tasks_end'],
      value: [row.Tasks_start.toISOString(), row.Tasks_end.toISOString()]
    };
    client.emit('data', event);
  }
  client.on('response', (data) => {
    if (data.query == 'get-edges') {
      data.row.Tasks_start = new Date(data.row.Tasks_start);
      data.row.Tasks_end = new Date(data.row.Tasks_end);
      gantt.init(data.row);
      client.emit('data', {
        query: 'select',
        module: 'viewAPUTasks',
        project: 3
      });
    }
    if (data.query == 'select') {
      if (data.row.APU_expand) {
        data.row.Tasks_start = null;
        data.row.Tasks_end = null;
      } else {
        data.row.Tasks_start = data.row.Tasks_start ? new Date(data.row.Tasks_start) : null;
        data.row.Tasks_end = data.row.Tasks_end ? new Date(data.row.Tasks_end) : null;
      }
      data.row.APU_description = data.row.APU_description || '';
      gantt.doselect(data.row);
    }
    if (data.query == 'update') {
      if (data.row.APU_expand) {
        return;
      }
      data.row.Tasks_start = data.row.Tasks_start ? new Date(data.row.Tasks_start) : null;
      data.row.Tasks_end = data.row.Tasks_end ? new Date(data.row.Tasks_end) : null;
      gantt.doupdate(data.row);
    }
    if (data.query == 'delete') {
      gantt.dodelete(data.row);
    }
  });
})(io);
