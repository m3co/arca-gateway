
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

// This test may change as it awaits for a notification without subscribing
test('Send a request, await for its response and a notification', async () => {
    const arca = new Arca();
    arca.config.arca.port = '22346';

    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve) => {
        await web.listen();
        client.connect();

        const id = 'id-of-error';
        const request = {
            ID: id,
            Method: `1-request-1-response-1-notification`,
            Context: {
                Source: 'test'
            }
        };
        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'error-in-the-middle',
            Context: { Source: 'test' },
            Result: { Message: 'this is the message' },
            Error: null
        };
        let expectedResponsePassed = false;

        const expectedNotification = {
            Context: {
                Source: 'test',
            },
            Error: null,
            ID: '',
            Method: 'notification-sent',
            Result: {
                Message: 'this is the message 1',
            },
        };
        let expectedNotificationPassed = false;
        let i = 0;

        client.on('jsonrpc', (res: any) => {
            i++;
            if (!expectedNotificationPassed) {
                expect(res).toStrictEqual(expectedNotification);
                expectedNotificationPassed = true;
                return;
            }
            if (!expectedResponsePassed) {
                expect(res).toStrictEqual(expectedResponse);
                expectedResponsePassed = true;
            }

            if ((i === 2) && expectedResponsePassed && expectedNotificationPassed) {
                resolve();
            }
        });

        client.emit('jsonrpc', request);
    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});

test('Check request to subscribe to Source', async () => {
    const arca = new Arca();
    arca.config.arca.port = '22346';

    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve) => {
       const request = {
            ID: 'id-of-error',
            Method: 'subscribe',
            Params: {
                Source: 'test'
            }
        };

        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'subscribe',
            Context: { Source: 'test' },
            Result: true
        };

        client.on('jsonrpc', (res: any) => {
            expect(res).toStrictEqual(expectedResponse);
            resolve();
        });

        await web.listen();
        client.connect();
        client.emit('jsonrpc', request);
    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});

test('Check request to subscribe to Target', async () => {
    const arca = new Arca();
    arca.config.arca.port = '22346';

    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve) => {
       const request = {
            ID: 'id-of-error',
            Method: 'subscribe',
            Params: {
                Target: 'test'
            }
        };

        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'subscribe',
            Context: { Target: 'test' },
            Result: true
        };

        client.on('jsonrpc', (res: any) => {
            expect(res).toStrictEqual(expectedResponse);
            resolve();
        });

        await web.listen();
        client.connect();
        client.emit('jsonrpc', request);
    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});

test('Check request to unsubscribe to Source', async () => {
    const arca = new Arca();
    arca.config.arca.port = '22346';

    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve) => {
       const request = {
            ID: 'id-of-error',
            Method: 'unsubscribe',
            Params: {
                Source: 'test'
            }
        };

        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'unsubscribe',
            Context: { Source: 'test' },
            Result: true
        };

        client.on('jsonrpc', (res: any) => {
            expect(res).toStrictEqual(expectedResponse);
            resolve();
        });

        await web.listen();
        client.connect();
        client.emit('jsonrpc', request);
    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});

test('Check request to unsubscribe to Target', async () => {
    const arca = new Arca();
    arca.config.arca.port = '22346';

    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve) => {
       const request = {
            ID: 'id-of-error',
            Method: 'unsubscribe',
            Params: {
                Target: 'test'
            }
        };

        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'unsubscribe',
            Context: { Target: 'test' },
            Result: true
        };

        client.on('jsonrpc', (res: any) => {
            expect(res).toStrictEqual(expectedResponse);
            resolve();
        });

        await web.listen();
        client.connect();
        client.emit('jsonrpc', request);
    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});

test('Three clients connect, one subscribes to Source and only one receives a notification', async () => {
    const arca = new Arca();
    arca.config.arca.port = '22346';

    const web = new Web({ arca });
    const clients = [
        SocketIO(`http://localhost:${web.config.port}/`),
        SocketIO(`http://localhost:${web.config.port}/`),
        SocketIO(`http://localhost:${web.config.port}/`)];

    function teardown() {
        clients.forEach(client => client.disconnect());
        web.close();
    }

    try { await new Promise(async (resolve, reject) => {

        const iSelected = 0;
        const timer = setTimeout(() => {
            resolve();
        }, 1000);

        const expectedNotification = {
            ID: '',
            Method: 'notification-sent',
            Context: { Source: 'test' },
            Result: { Message: 'this is the message 1' },
            Error: null
        };
        clients.forEach((client, i) => client.on('jsonrpc', (res: any) => {
            if (i === iSelected) {
                if (res.ID === '') {
                    expect(res).toStrictEqual(expectedNotification);
                }
            } else {
                clearTimeout(timer);
                reject(new Error('Notification ocurred without being subscripted'));
            }
        }));

        await web.listen();
        clients.forEach(client => client.connect());
        clients[iSelected].emit('jsonrpc', {
            ID: 'id-of-error',
            Method: 'subscribe',
            Params: {
                Source: 'test'
            }
        });
        clients[iSelected].emit('jsonrpc', {
            ID: 'id-of-error',
            Method: `1-request-1-response-1-notification`,
            Context: {
                Source: 'test'
            }
        });

    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});
