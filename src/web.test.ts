
import * as SocketIO from 'socket.io-client';

import { Web } from './index';
import { v4 as uuidv4 } from 'uuid';
import { Arca } from './arca';

test('Check the connection', async () => {
    await new Promise((resolve) => {
        const web = new Web({ arca: new Arca() });
        const client = SocketIO(`http://localhost:${web.config.port}/`);

        client.on('connect', () => {
            client.disconnect();
            web.close();
            resolve();
        });

        web.listen();
        client.connect();
    });
});

// surely this test will delete soon...
test('Send a request, await a response', async () => {
    await new Promise((resolve) => {
        const web = new Web({ arca: new Arca() });
        const client = SocketIO(`http://localhost:${web.config.port}/`);
        const id = 'an-ID';

        client.on('connect', () => {
            client.emit('jsonrpc', { ID: id, Method: 'A request' });
        });

        client.on('jsonrpc', (res: any) => {
            expect(res).toStrictEqual({ ID: id, Method: 'A response' });
            teardown();
        })

        web.listen();
        client.connect();

        function teardown() {
            client.disconnect();
            web.close();
            resolve();
        }
    });
});

// surely this test will delete soon...
test('Send a request, await a response from an "Arca" instance', async () => {
    const arca = new Arca();
    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
        arca.disconnect();
    }

    try { await new Promise(async (resolve) => {
        await arca.connect();
        const id = uuidv4();
        await arca.connect();

        const request = {
            ID: id,
            Method: 'test',
            Context: {
                Source: 'test-source'
            }
        }

        client.on('connect', () => {
            client.emit('jsonrpc', request); // this should change to smth like request
        });

        client.on('jsonrpc', (res: any) => {
            teardown();
            expect(res.ID).toStrictEqual(request.ID); // this should be smth like await response
            resolve();
        })

        web.listen();
        client.connect();
    }); } catch(err) {
        fail(err);
    }

    teardown();
});
