
import * as SocketIO from 'socket.io-client';

import { Web } from './index';
import { v4 as uuidv4 } from 'uuid';
import { Arca } from './arca';

test('Check the connection', async () => {
    const web = new Web({ arca: new Arca() });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    try { await new Promise(async (resolve) => {
        client.on('connect', () => {
            resolve();
        });

        await web.listen();
        client.connect();
    }); } catch(err) {
        fail(err);
    }

    client.disconnect();
    web.close();
});

// surely this test will delete soon...
test('Send a request, await a response from an "Arca" instance', async () => {
    const arca = new Arca();
    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve) => {
        await arca.connect();
        const id = uuidv4();
        const request = {
            ID: id,
            Method: 'test',
            Context: {
                Source: 'test-source'
            },
        };
        const expectedResponse = {
            ID: id,
            Method: 'test',
            Context: { Source: 'test-source' },
            Result: { success: 'indeed' },
            Error: null,
        }

        client.on('connect', () => {
            client.emit('jsonrpc', request);
        });

        client.on('jsonrpc', (res: any) => {
            expect(res).toStrictEqual(expectedResponse);
            resolve();
        })

        await web.listen();
        client.connect();
    }); } catch(err) {
        fail(err);
    }

    teardown();
});
