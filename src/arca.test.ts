
import { Arca } from './arca';
import { Request, Response } from './types';
import { v4 as uuidv4 } from 'uuid';

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
    try { await new Promise(async (resolve) => {
        const expectedNotification = {
            "Context": {
                "Source": "test",
            },
            "Error": null,
            "ID": "",
            "Method": "error-in-the-middle",
            "Result": {
                "Message": "this is the message",
            },
        };

        const onNotification = (notification: Response) => {
            expect(notification).toStrictEqual(expectedNotification);
            resolve();
            arca.disconnect();
        }

        const arca = new Arca({onNotification});
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

    })} catch(err) {
        fail(err);
    }
});

test(`Two responses in 2 parts - first response broken, second response ok`, async () => {
    try { await new Promise(async (resolve) => {
        const expectedNotification = {
            "Context": {
                "Source": "test",
            },
            "Error": null,
            "ID": "",
            "Method": "error-in-the-middle",
            "Result": {
                "Message": "this is the message",
            },
        };

        const onNotification = (notification: Response) => {
            expect(notification).toStrictEqual(expectedNotification);
            resolve();
            arca.disconnect();
        }

        const arca = new Arca({onNotification});
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

    })} catch(err) {
        fail(err);
    }
});

test(`Two responses in 2 parts - first response ok, second response broken`, async () => {
    try { await new Promise(async (resolve) => {
        const expectedNotification = {
            "Context": {
                "Source": "test",
            },
            "Error": null,
            "ID": "",
            "Method": "error-in-the-middle",
            "Result": {
                "Message": "this is the message",
            },
        };

        const onNotification = (notification: Response) => {
            expect(notification).toStrictEqual(expectedNotification);
            resolve();
            arca.disconnect();
        }

        const arca = new Arca({onNotification});
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

    })} catch(err) {
        fail(err);
    }
});

test(`Two responses in 2 parts - first response broken, second response broken`, async () => {
    try { await new Promise(async (resolve) => {
        const expectedNotification = {
            "Context": {
                "Source": "test",
            },
            "Error": null,
            "ID": "",
            "Method": "error-in-the-middle",
            "Result": {
                "Message": "this is the message",
            },
        };

        const onNotification = (notification: Response) => {
            expect(notification).toStrictEqual(expectedNotification);
            resolve();
            arca.disconnect();
        }

        const arca = new Arca({onNotification});
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

    })} catch(err) {
        fail(err);
    }
});

test(`Two responses in 2 parts - first response ok(no EOL), second response broken`, async () => {
    try { await new Promise(async (resolve) => {
        const expectedNotification = {
            "Context": {
                "Source": "test",
            },
            "Error": null,
            "ID": "",
            "Method": "error-in-the-middle",
            "Result": {
                "Message": "this is the message",
            },
        };

        const onNotification = (notification: Response) => {
            expect(notification).toStrictEqual(expectedNotification);
            resolve();
            arca.disconnect();
        }

        const arca = new Arca({onNotification});
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

    })} catch(err) {
        fail(err);
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
    try { await new Promise(async (resolve) => {
        const expectedNotification = {
            "Context": {
                "Source": "test",
            },
            "Error": null,
            "ID": "",
            "Method": "notification-sent",
            "Result": {
                "Message": "this is the message 1",
            },
        };

        const onNotification = (notification: Response) => {
            expect(notification).toStrictEqual(expectedNotification);
            resolve();
            arca.disconnect();
        }

        const arca = new Arca({onNotification});
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

    })} catch(err) {
        fail(err);
    }
});

test(`Connect and wait - got a response and a notification`, async () => {
    try { await new Promise(async (resolve, reject) => {
        let i = 0;
        const expectedNotification = {
            ID: '',
            Method: 'notification',
            Context: { Source: 'test' },
            Result: { Message: 'this is the message' },
            Error: null
        };

        const onNotification = (notification: Response) => {
            i++;
            if (i > 1) {
                reject(new Error('unexepected notification'));
                return;
            }
            expect(notification).toStrictEqual(expectedNotification);
        }

        const arca = new Arca({onNotification});
        arca.config.arca.port = '22347'

        await arca.connect();
        setTimeout(() => {
            resolve();
            arca.disconnect();
        }, 300);

    })} catch(err) {
        const error = err as Error;
        if (error.message !== 'Timeout at getResponses()') {
            fail(err);
        }
    }
});

test(`Connect and wait - got a response and a notification but process only the notification`, async () => {
    try { await new Promise(async (resolve) => {
        const expectedNotification = {
            ID: '',
            Method: 'notification',
            Context: { Source: 'test' },
            Result: { Message: 'this is the message' },
            Error: null
        };

        const onNotification = (notification: Response) => {
            expect(notification).toStrictEqual(expectedNotification);
            resolve();
        }
        const arca = new Arca({onNotification});
        arca.config.arca.port = '22347'

        await arca.connect();
        setTimeout(() => {
            arca.disconnect();
        }, 100);
    })} catch(err) {
        fail(err);
    }
});
