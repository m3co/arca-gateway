'use strict';
const fs = require('fs');
const ini = require('ini');
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
const bunyan = require('bunyan');
const log = bunyan.createLogger({
  name: 'arca-gateway',
  streams: [{
      path: './arca-gateway.log',
  }]
});

const proxy = require('http').createServer(handler)
const staticProxy = require('http-proxy').createProxyServer({});
const io = require('socket.io')(proxy);
const net = require('net');

const arca = new net.Socket();
const sockets = {};
const IDs = {};
const Subscriptions = {
  Targets: {},
  Sources: {},
};
const FACADIDs = {};

let lastFACADData = '';
function recoverAndProcessFACAD(data, socket) {
  const beforeData = lastFACADData.toString();
  lastFACADData = lastFACADData + data.toString();
  try {
    let msg = JSON.parse(lastFACADData);
    FACADIDs[msg.ID] = socket;
    arca.write(JSON.stringify(msg) + '\n');
    lastFACADData = '';
  } catch(e) {
    // The following line is a good log candidate
    log.error({
      source: 'recoverAndProcessFACAD',
      error: e,
      data,
      lastData: beforeData
    });
  }
}

const facad = new net.createServer((socket) => {
  socket.on('data', (data) => {
    if (data.length > 0) {
      const rows = data.toString().split('\n').filter((str) => str.length > 0);
      if (rows.length > 1) {
        rows.forEach(data => {
          recoverAndProcessFACAD(data, socket);
        });
      } else {
        recoverAndProcessFACAD(data, socket);
      }
    }
  });

  socket.on('close', () => {
    Object.keys(FACADIDs).forEach((ID) => {
      if (FACADIDs[ID] == socket) {
        delete FACADIDs[ID];
      }
    });
  });
});

arca.setEncoding('utf-8');

arca.on('error', (data) => {
  // The following line is a good log candidate
  log.error(`Error: ${data}`)
});

let lastData = '';
function recorverAndProcess(data) {
  const beforeData = lastData.toString();
  lastData = lastData + data;
  try {
    let msg = JSON.parse(lastData);
    processMessage(msg);
  } catch(e) {
    // The following line is a good log candidate
    log.error({
      source: 'recorverAndProcess',
      error: e,
      data,
      lastData: beforeData
    });
  }
}

arca.on('data', (data) => {
  if (data.length > 0) {
    const rows = data.split('\n').filter((str) => str.length > 0);
    if (rows.length > 1) {
      rows.forEach(data => {
        try {
          let msg = JSON.parse(data);
          processMessage(msg);
        } catch(e) {
          // The following line is a good log candidate
          // console.log(`Parsing error: ${e}, data: ${data}`);
          recorverAndProcess(data);
        }
      });
      return;
    }
    try {
      let msg = JSON.parse(data);
      processMessage(msg);
    } catch(e) {
      // The following line is a good log candidate
      // console.log(`Parsing error: ${e}, data: ${data}`);
      recorverAndProcess(data);
    }
  }
});

function processMessage(msg) {
  let ID;
  if (msg) {
    if (msg.Data && msg.Data.ID) {
      ID = msg.Data.ID;
    } else {
      ID = msg.ID;
    }
    if (ID) {
      // The following line is a good log candidate
      if (IDs[ID]) {
        lastData = '';
        IDs[ID].socket.emit('jsonrpc', msg);
        delete IDs[ID];
      }
      if (FACADIDs[ID]) {
        FACADIDs[ID].write(JSON.stringify(msg) + '\n');
        delete FACADIDs[ID];
      }
    } else {
      // The following line is a good log candidate
      const ch = Subscriptions.Targets[msg.Context.Target];
      ch && Object.keys(sockets).forEach(id =>
        ch[id] && ch[id].emit('jsonrpc', msg)
      );
    }
  }
}

arca.on('close', () => {
  setTimeout(() => {
    if (arca.writable) {
      // The following line is a good log candidate
      log.info('reconnected to arca');
    } else {
      // The following line is a good log candidate
      log.info('reconnecting with arca');
      arca.connect(config.arca.port, config.arca.host);
    }
  }, 1000)

  // The following line is a good log candidate
	log.info('connection to arca closed');
});

function subscribe(data, socket) {
  // The following line is a good log candidate
  if (data.Params) {
    if (data.Params.Target) {
      if (Subscriptions.Targets[data.Params.Target]) {} else {
        Subscriptions.Targets[data.Params.Target] = {};
      }
      Subscriptions.Targets[data.Params.Target][socket.id] = socket;
      socket.emit('jsonrpc', {
        ID: data.ID,
        Method: data.Method,
        Context: {
          Target: data.Params.Target
        },
        Result: "Success",
      });
      return;
    } else if (data.Params.Source) {
      if (Subscriptions.Sources[data.Params.Source]) {} else {
        Subscriptions.Sources[data.Params.Source] = {};
      }
      Subscriptions.Sources[data.Params.Source][socket.id] = socket;
      socket.emit('jsonrpc', {
        ID: data.ID,
        Method: data.Method,
        Context: {
          Source: data.Params.Source
        },
        Result: "Success",
      });
      return;
    }
    socket.emit('jsonrpc', {
      Code: -32600,
      Message: 'Invalid Request',
      Data: {
        ID: data.ID,
        Method: data.Method,
      },
    });
  }
}

function unsubscribe(socket) {
  // The following line is a good log candidate
  const foundTarget = [];
  const foundSource = [];
  Object.keys(Subscriptions.Targets).forEach((target) => {
    foundTarget.push(
     ...Object.keys(Subscriptions.Targets[target])
              .filter(id => id === socket.id)
              .map(id => ({target, id})));
  });
  Object.keys(Subscriptions.Sources).forEach((source) => {
    foundSource.push(
     ...Object.keys(Subscriptions.Sources[source])
              .filter(id => id === socket.id)
              .map(id => ({source, id})));
  });
  foundTarget.forEach(found =>
    delete Subscriptions.Targets[found.target][found.id]);
  foundSource.forEach(found =>
    delete Subscriptions.Sources[found.source][found.id]);
}

io.on('connect', (socket) => {
  sockets[socket.id] = socket;
  log.info('connect');

  socket.on('jsonrpc', (data) => {
    log.info('jsonrpc', data);
    if (arca.writable) {
      IDs[data.ID] = {
        socket,
        CreatedAt: Date.now(),
      };

      if (data.Method == 'Subscribe') {
        subscribe(data, socket);
      } else if (data.Method == 'Unsubscribe') {
        unsubscribe(socket);
      } else {
        // The following line is a good log candidate
        arca.write(JSON.stringify(data) + '\n');
      }
    }
  });

  socket.on('disconnect', () => {
    log.info('disconnect');
    unsubscribe(socket);
    // The following line is a good log candidate
    delete sockets[socket.id];
  })
});

// Here we put bind all the params with config
arca.connect(config.arca.port, config.arca.host);
facad.listen(config.facad.port, config.facad.host);
proxy.listen(config.port);
function handler (req, res) {
  staticProxy.web(req, res, { target: config.static.target }, (err) => {
    log.error(err);
  });
}
