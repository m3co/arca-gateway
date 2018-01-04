'use strict';
var net = require('net');
var arca = new net.Socket();
var io = require('socket.io')();

arca.sendObject = function sendObject(o) {
  arca.write(JSON.stringify(o));
  // THIS IS AN ERROR, BUT ANYWAY... LETS ACCEPT THIS FACT
  arca.write('\n');
  // IN FACT, WE'VE TO SEND THE SYMBOL EOF(end-of-file) IN ORDER TO
  // FLUSH THE TRANSMISSION OF THIS STRING
}

arca.connect(12345, 'localhost', () => {
  console.log('connected to ARCA');
  var e = {
    query: 'subscribe',
    module: 'Supplies'
  };
  arca.sendObject(e);
});


arca.on('data', data => {
  console.log('data from ARCA:\n' + data);
});


arca.on('close', () => {
  console.log('disconnected from ARCA');
});

io.on('connection', function(client){});
io.listen(9000);
