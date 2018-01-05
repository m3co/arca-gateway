'use strict';
var net = require('net');
var io = require('socket.io')();

function connectToArca(client) {
  var arca = new net.Socket();
  arca.sendObject = function sendObject(o) {
    arca.write(JSON.stringify(o));
    // THIS IS AN ERROR, BUT ANYWAY... LETS ACCEPT THIS FACT
    arca.write('\n');
    // IN FACT, WE'VE TO SEND THE SYMBOL EOF(end-of-file) IN ORDER TO
    // FLUSH THE TRANSMISSION OF THIS STRING
  }

  arca.connect(12345, 'localhost', () => {
    console.log('connected to ARCA');
  });

  arca.on('data', data => {
    var str = data.toString();
    if (str.length > 0) {
      str.split("\r\n").forEach(s => {
        if (s.length > 0) {
          client.emit('response', JSON.parse(s));
        }
      });
    }
  });

  arca.on('close', () => {
    console.log('disconnected from ARCA');
  });
  return arca;
}

io.on('connection', client => {
  console.log('connected');

  var arca = connectToArca(client);

  client.on('data', data => {
    console.log(data);
    arca.sendObject(data);
  });

  client.on('disconnect', () => {
    console.log('disconnect');
    arca.end();
  });
});

io.listen(9000);
