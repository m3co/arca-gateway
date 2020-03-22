
import { Web } from './index';
import * as SocketIO from 'socket.io-client';

test('Check the connection', async () => {
    await new Promise((resolve) => {
        const web = new Web();
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

test('Send a request, await a response', async () => {
    await new Promise((resolve) => {
        const web = new Web();
        const client = SocketIO(`http://localhost:${web.config.port}/`);

        client.on('connect', () => {
            client.emit('jsonrpc', { ID: 'an-ID', Method: 'A request' });
        });

        client.on('jsonrpc', (res: any) => {
            expect(res).toStrictEqual({ ID: 'an-ID', Method: 'A response' });
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
