'use strict';
const fs = require('fs');
const Ini = require('ini');
const net = require('net');
const io = require('socket.io')();
const config = Ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

function connectToArca(client) {
  var arca = new net.Socket();
  arca.sendObject = function sendObject(o) {
    arca.write(JSON.stringify(o));
    // THIS IS AN ERROR, BUT ANYWAY... LETS ACCEPT THIS FACT
    arca.write('\n');
    // IN FACT, WE'VE TO SEND THE SYMBOL EOF(end-of-file) IN ORDER TO
    // FLUSH THE TRANSMISSION OF THIS STRING
  }

  arca.connect(Number(config.arca.port), config.arca.host, () => {
    console.log('connected to ARCA');
  });

  var lasterror = '';
  arca.on('data', data => {
    var str = data.toString();
    if (str.length > 0) {
      str.split("\r\n").forEach(s => {
        if (s.length > 0) {
          var msg;
          try {
            msg = JSON.parse(lasterror + s);
            lasterror = '';
          } catch(e) {
            console.log(`something went wrong with JSON.parse ${lasterror + s}`);
            lasterror = lasterror + s;
            return;
          }
          if (msg.action == 'check-conn') return;
          client.emit('response', msg);
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

io.listen(Number(config.port));
