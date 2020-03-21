
import { Arca } from './index';
import { Request } from './types';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'net'

test('Send a first simple request', async () => {
    try {
        const arca = new Arca();
        const id = uuidv4();
        await arca.connect();

        const request = {
            ID: id,
            Method: 'test',
            Context: {
                Source: 'test-source'
            }
        }

        const response = await arca.request(request);
        expect(response.ID).toBe(id);
        arca.disconnect();
    } catch(err) {
        fail(err);
    }
});

test('Reconnect and process the request', async () => {
    const arca = new Arca();
    const oldPort = arca.config.arca.port;
    arca.config.arca.port = '0';

    try {
        await arca.connect(100);
    } catch(err) {
        arca.config.arca.port = oldPort;
        await new Promise<void>((resolve, reject) => {
            setTimeout(async() => {
                const id = uuidv4();
                const request = {
                    ID: id,
                    Method: 'test',
                    Context: {
                        Source: 'test-source'
                    }
                }
                try {
                    const response = await arca.request(request);
                    expect(response.ID).toBe(id);
                    arca.disconnect();
                    resolve();
                } catch(err) {
                    reject(err);
                }
            }, 300); // after 300ms, let's try to send a request
        });
    }
});

['2', '3', '4'].forEach((part: string) => {
    test(`A response in ${part} parts`, async () => {
        try {
            const arca = new Arca();
            arca.config.arca.port = '22346'

            const id = 'id-of-error';
            await arca.connect();

            const request = {
                ID: id,
                Method: `msg-in-${part}-parts`,
                Context: {
                    Source: 'test-source'
                }
            }

            const response = await arca.request(request);
            expect(response.ID).toBe(id);
            arca.disconnect();
        } catch(err) {
            fail(err);
        }
    });
});

test(`Two responses in 1 parts`, async () => {
    try {
        const arca = new Arca();
        arca.config.arca.port = '22346'

        const id = 'id-of-error';
        await arca.connect();

        const request = {
            ID: id,
            Method: `2-msg-in-1-parts`,
            Context: {
                Source: 'test-source'
            }
        }

        const response = await arca.request(request);
        expect(response.ID).toBe(id);

        for await(const extraResponse of arca.responses()) {
            expect(extraResponse).toStrictEqual({
                "Context": {
                    "Source": "test",
                },
                "Error": null,
                "ID": "something else",
                "Method": "error-in-the-middle",
                "Result": {
                    "Message": "this is the message",
                },
            });
            break;
        }

        arca.disconnect();
    } catch(err) {
        fail(err);
    }
});

test(`Two responses in 2 parts - first response broken, second response ok`, async () => {
    try {
        const arca = new Arca();
        arca.config.arca.port = '22346'

        const id = 'id-of-error';
        await arca.connect();

        const request = {
            ID: id,
            Method: `2-msg-in-2-parts-where-1-break-2-ok`,
            Context: {
                Source: 'test-source'
            }
        }

        const response = await arca.request(request);
        expect(response.ID).toBe(id);

        for await(const extraResponse of arca.responses()) {
            expect(extraResponse).toStrictEqual({
                "Context": {
                    "Source": "test",
                },
                "Error": null,
                "ID": "something else",
                "Method": "error-in-the-middle",
                "Result": {
                    "Message": "this is the message",
                },
            });
            break;
        }

        arca.disconnect();
    } catch(err) {
        fail(err);
    }
});

test(`Two responses in 2 parts - first response ok, second response broken`, async () => {
    try {
        const arca = new Arca();
        arca.config.arca.port = '22346'

        const id = 'id-of-error';
        await arca.connect();

        const request = {
            ID: id,
            Method: `2-msg-in-2-parts-where-1-ok-2-break`,
            Context: {
                Source: 'test-source'
            }
        }

        const response = await arca.request(request);
        expect(response.ID).toBe(id);

        for await(const extraResponse of arca.responses()) {
            expect(extraResponse).toStrictEqual({
                "Context": {
                    "Source": "test",
                },
                "Error": null,
                "ID": "something else",
                "Method": "error-in-the-middle",
                "Result": {
                    "Message": "this is the message",
                },
            });
            break;
        }

        arca.disconnect();
    } catch(err) {
        fail(err);
    }
});

test(`Two responses in 2 parts - first response broken, second response broken`, async () => {
    try {
        const arca = new Arca();
        arca.config.arca.port = '22346'

        const id = 'id-of-error';
        await arca.connect();

        const request = {
            ID: id,
            Method: `2-msg-in-2-parts-where-1-break-2-break`,
            Context: {
                Source: 'test-source'
            }
        }

        const response = await arca.request(request);
        expect(response.ID).toBe(id);

        for await(const extraResponse of arca.responses()) {
            expect(extraResponse).toStrictEqual({
                "Context": {
                    "Source": "test",
                },
                "Error": null,
                "ID": "something else",
                "Method": "error-in-the-middle",
                "Result": {
                    "Message": "this is the message",
                },
            });
            break;
        }

        arca.disconnect();
    } catch(err) {
        fail(err);
    }
});

test(`Two responses in 2 parts - first response ok(no EOL), second response broken`, async () => {
    try {
        const arca = new Arca();
        arca.config.arca.port = '22346'

        const id = 'id-of-error';
        await arca.connect();

        const request = {
            ID: id,
            Method: `2-msg-in-2-parts-where-1-ok-noEOL-2-break`,
            Context: {
                Source: 'test-source'
            }
        }

        const response = await arca.request(request);
        expect(response.ID).toBe(id);

        let i = 0;
        for await(const extraResponse of arca.responses()) {
            expect(extraResponse).toStrictEqual({
                "Context": {
                    "Source": "test",
                },
                "Error": null,
                "ID": "something else",
                "Method": "error-in-the-middle",
                "Result": {
                    "Message": "this is the message",
                },
            });
            i++;
            if (i > 1) {
                fail(new Error('Unexpected execution. Got extraResponses'));
            }
        }
        arca.disconnect();
    } catch(err) {
        const error = err as Error;
        if (error.message !== 'Timeout at getResponses()') {
            fail(err);
        }
    }
});

test('Three requests', async () => {
    try {
        const arca = new Arca();
        await arca.connect();

        const requests = [{
            ID: uuidv4(),
            Method: 'test',
            Context: {
                Source: 'test-source',
            }
        },
        {
            ID: uuidv4(),
            Method: 'test',
            Context: {
                Source: 'test-source'
            }
        },
        {
            ID: uuidv4(),
            Method: 'test',
            Context: {
                Source: 'test-source'
            }
        }] as Request[];

        const responses = await Promise.all(requests.map(request => arca.request(request)));
        responses.forEach((response, i) => {
            expect(response.ID).toBe(requests[i].ID);
        });
        arca.disconnect();
    } catch(err) {
        fail(err);
    }
});

test(`One request - a response and a notification`, async () => {
    try {
        const arca = new Arca();
        arca.config.arca.port = '22346'

        const id = 'id-of-error';
        await arca.connect();

        const request = {
            ID: id,
            Method: `1-request-1-response-1-notification`,
            Context: {
                Source: 'test-source'
            }
        }

        const response = await arca.request(request);
        expect(response.ID).toBe(id);

        for await(const extraResponse of arca.responses()) {
            expect(extraResponse).toStrictEqual({
                "Context": {
                    "Source": "test",
                },
                "Error": null,
                "ID": "",
                "Method": "notification-sent",
                "Result": {
                    "Message": "this is the message 1",
                },
            });
            break;
        }

        arca.disconnect();
    } catch(err) {
        fail(err);
    }
});

// This is an error. Never a response will come without sending a request!
// but, who knows!
test(`Connect and wait - got a response and a notification`, async () => {
    try {
        const arca = new Arca();
        arca.config.arca.port = '22347'

        await arca.connect();
        const expectedResponses = [
            {
                ID: 'id-request',
                Method: 'requested',
                Context: { Source: 'test' },
                Result: { Message: 'this is the message' },
                Error: null
            },
            {
                ID: '',
                Method: 'notification',
                Context: { Source: 'test' },
                Result: { Message: 'this is the message' },
                Error: null
            }
        ];
        let i = 0;
        for await(const response of arca.responses()) {
            expect(response).toStrictEqual(expectedResponses[i]);
            i++;
            if (i > 2) {
                fail(new Error('Unexpected execution. Got extraResponses'));
            }
        }

        arca.disconnect();
    } catch(err) {
        const error = err as Error;
        if (error.message !== 'Timeout at getResponses()') {
            fail(err);
        }
    }
});

test(`Connect and wait - got a response and a notification but await only notifications`, async () => {
    try {
        const arca = new Arca();
        arca.config.arca.port = '22347'

        await arca.connect();
        const expectedNotifications = [
            {
                ID: '',
                Method: 'notification',
                Context: { Source: 'test' },
                Result: { Message: 'this is the message' },
                Error: null
            }
        ];
        let i = 0;
        for await(const notification of arca.notifications()) {
            if (notification.ID) {
                fail(new Error('Unexpected execution. Got something strange'));
            } else {
                expect(notification).toStrictEqual(expectedNotifications[i]);
                break;
            }
        }

        arca.disconnect();
    } catch(err) {
        const error = err as Error;
        if (error.message !== 'Timeout at getResponses()') {
            fail(err);
        }
    }
});
