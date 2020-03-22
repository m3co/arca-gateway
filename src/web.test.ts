
import * as SocketIO from 'socket.io-client';

import { Web } from './index';
import { v4 as uuidv4 } from 'uuid';
import { Arca } from './arca';

function generateRequestAndResponse() {
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
    return { request, expectedResponse };
}

function launchRequestWaitResponse(client: SocketIOClient.Socket) {
    return new Promise((resolve) => {
        const { request, expectedResponse } = generateRequestAndResponse();
        client.emit('jsonrpc', request);
        client.once('jsonrpc', (res: any) => {
            expect(res).toStrictEqual(expectedResponse);
            resolve();
        })
    });
}

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
        client.disconnect();
        web.close();
        fail(err);
    }

    client.disconnect();
    web.close();
});

test('Send some requests, await for their responses from an "Arca" instance', async () => {
    const arca = new Arca();
    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve) => {
        await web.listen();
        client.connect();

        await launchRequestWaitResponse(client);
        await launchRequestWaitResponse(client);
        await launchRequestWaitResponse(client);

        resolve();
    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});

test('Send an incorrect request and fail', async () => {
    const arca = new Arca();
    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve) => {
        await web.listen();
        client.connect();

        await new Promise(resolve => {
            const request = 'something incorrect';
            const expectedResponse = {
                Method: 'socket.on::jsonrpc',
                Error: {
                    Code: -32700,
                    Message: 'Parse error',
                }
            };

            client.emit('jsonrpc', request);
            client.once('jsonrpc', (res: any) => {
                expect(res).toStrictEqual(expectedResponse);
                resolve();
            });
        });

        resolve();
    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});
