
import { Web } from './index';
import * as SocketIO from 'socket.io-client';
import { resolveLevel } from 'bunyan';

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
})
