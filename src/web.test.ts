
import * as SocketIO from 'socket.io-client';

import { Web } from './web';
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

test('Send a request, await for its response and skip the notification', async () => {
    const arca = new Arca();
    arca.config.arca.port = '22346';

    const web = new Web({ arca });
    const client = SocketIO(`http://localhost:${web.config.port}/`);

    function teardown() {
        client.disconnect();
        web.close();
    }

    try { await new Promise(async (resolve, reject) => {
        await web.listen();
        client.connect();

        setTimeout(() => {
            resolve();
        }, 200);

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

        let i = 0;

        client.on('jsonrpc', (res: any) => {
            if (i === 0) {
                expect(res).toStrictEqual(expectedResponse);
            } else {
                reject(new Error('Received an unexpected response'));
            }
            i++;
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
            Method: 'Subscribe',
            Params: {
                Source: 'test'
            }
        };

        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'Subscribe',
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
            Method: 'Subscribe',
            Params: {
                Target: 'test'
            }
        };

        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'Subscribe',
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
            Method: 'Unsubscribe',
            Params: {
                Source: 'test'
            }
        };

        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'Unsubscribe',
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
            Method: 'Unsubscribe',
            Params: {
                Target: 'test'
            }
        };

        const expectedResponse = {
            ID: 'id-of-error',
            Method: 'Unsubscribe',
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

        const iSelected = Math.floor(Math.random() * clients.length);
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
            Method: 'Subscribe',
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

test('Three clients connect, one subscribes to Target and only one receives a notification', async () => {
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

        const iSelected = Math.floor(Math.random() * clients.length);
        const timer = setTimeout(() => {
            resolve();
        }, 1000);

        const expectedNotification = {
            ID: '',
            Method: 'notification-sent',
            Context: { Target: 'test' },
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
            Method: 'Subscribe',
            Params: {
                Target: 'test'
            }
        });
        clients[iSelected].emit('jsonrpc', {
            ID: 'id-of-error',
            Method: `1-request-1-response-1-notification-target`,
            Context: {
                Target: 'test'
            }
        });

    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});

test('Three clients connect, two subscribes to Source, both receives, one unsubscribe and only one receives a notification', async () => {
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

        const iSelected = [0, 1];
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
        let clientUnsubscribed = false;

        clients.forEach((client, i) => client.on('jsonrpc', (res: any) => {
            if (i in iSelected) {
                if (res.ID === '') {
                    if (i === 1 && clientUnsubscribed) {
                        reject(new Error('Notification ocurred after being unsubscripted'));
                        return;
                    }
                    expect(res).toStrictEqual(expectedNotification);
                    return;
                }
                if (i === 1 && res.ID && res.Method === 'unsubscribe') {
                    expect(res).toStrictEqual({
                        ID: 'id-of-error2',
                        Method: 'Unsubscribe',
                        Context: { Source: 'test' },
                        Result: true
                    });
                    clientUnsubscribed = true;
                    return;
                }
            } else {
                clearTimeout(timer);
                reject(new Error('Notification ocurred without being subscripted'));
            }
        }));

        await web.listen();
        clients.forEach(client => client.connect());

        // two subscribe to Source = test
        iSelected.forEach(i => {
            const request = {
                ID: 'id-of-error3',
                Method: 'Subscribe',
                Params: {
                    Source: 'test'
                }
            };
            clients[i].emit('jsonrpc', request);
        });

        // one request, two receive the notification
        const request = {
            ID: 'id-of-error-something-else',
            Method: `1-request-1-response-1-notification`,
            Context: {
                Source: 'test'
            }
        };
        clients[0].emit('jsonrpc', request);

        // a client unsubscribes
        setTimeout(() => {
            const request2 = {
                ID: 'id-of-error2',
                Method: 'Unsubscribe',
                Params: {
                    Source: 'test'
                }
            };
            clients[1].emit('jsonrpc', request2);
            request.ID = 'something-different';
            clients[0].emit('jsonrpc', request);
        }, 200);

    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});

test('Three clients connect, two subscribes to Target, both receives, one unsubscribe and only one receives a notification', async () => {
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

        const iSelected = [0, 1];
        const timer = setTimeout(() => {
            resolve();
        }, 1000);

        const expectedNotification = {
            ID: '',
            Method: 'notification-sent',
            Context: { Target: 'test' },
            Result: { Message: 'this is the message 1' },
            Error: null
        };
        let clientUnsubscribed = false;

        clients.forEach((client, i) => client.on('jsonrpc', (res: any) => {
            if (i in iSelected) {
                if (res.ID === '') {
                    if (i === 1 && clientUnsubscribed) {
                        reject(new Error('Notification ocurred after being unsubscripted'));
                        return;
                    }
                    expect(res).toStrictEqual(expectedNotification);
                    return;
                }
                if (i === 1 && res.ID && res.Method === 'unsubscribe') {
                    expect(res).toStrictEqual({
                        ID: 'id-of-error2',
                        Method: 'Unsubscribe',
                        Context: { Target: 'test' },
                        Result: true
                    });
                    clientUnsubscribed = true;
                    return;
                }
            } else {
                clearTimeout(timer);
                reject(new Error('Notification ocurred without being subscripted'));
            }
        }));

        await web.listen();
        clients.forEach(client => client.connect());

        // two subscribe to Target = test
        iSelected.forEach(i => {
            const request = {
                ID: 'id-of-error3',
                Method: 'Subscribe',
                Params: {
                    Target: 'test'
                }
            };
            clients[i].emit('jsonrpc', request);
        });

        // one request, two receive the notification
        const request = {
            ID: 'id-of-error-something-else',
            Method: `1-request-1-response-1-notification`,
            Context: {
                Target: 'test'
            }
        };
        clients[0].emit('jsonrpc', request);

        // a client unsubscribes
        setTimeout(() => {
            const request2 = {
                ID: 'id-of-error2',
                Method: 'Unsubscribe',
                Params: {
                    Target: 'test'
                }
            };
            clients[1].emit('jsonrpc', request2);
            request.ID = 'something-different';
            clients[0].emit('jsonrpc', request);
        }, 200);

    }); } catch(err) {
        teardown();
        fail(err);
    }
    teardown();
});
