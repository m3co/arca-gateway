
import * as SocketIO from 'socket.io-client';

import { Web } from './web';
import { Arca } from './arca';
import { Response } from './types';

test('Request Select a source returns a response', async () => {
    const arca = new Arca();
    arca.config.arca.port = '22346';

    const web = new Web({ arca });
    await web.listen();
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    const request = {
        ID: 'id-of-error',
        Method: 'Select',
        Context: {
            Source: 'test'
        },
        Params: {
            PK: {
                ProjectID: 5,
                Key: '1.1'
            },
        }
    };
    const expectedResponse = {
        ID: 'id-of-error',
        Method: 'Select',
        Context: { Source: 'test' },
        Result: true
    }

    try {
        await new Promise(resolve => {
            client.on('jsonrpc', (res: Response) => {
                expect(res).toStrictEqual(expectedResponse);
                resolve();
            });

            client.connect();
            client.emit('jsonrpc', request);
        });
    } catch(err) {
        fail(err);
    }

    client.disconnect();
    web.close();
});
