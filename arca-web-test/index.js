'use strict';
const conn = io();

conn.on('jsonrpc', (res) => {
    console.log(res);
});

setTimeout(() => {

    conn.emit('jsonrpc', {
        ID: 'an-id',
        Method: 'test',
        Context: {
            Source: 'test-source'
        },
    });

}, 200);
