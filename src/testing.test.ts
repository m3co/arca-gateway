
import { Arca } from './index';
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


// Probar
// Request> [Msg1, Msg2]: Msg1 = PartA U PartB, Msg2 = Msg2
// Request> [Msg1, Msg2]: Msg1 = PartA U PartB, Msg2 = PartB U PartC
// Request> [Msg1, Msg2]: Msg1 = PartA U PartB(incluido el ENTER), Msg2 = (sin el ENTER)Msg2
// Request> [Msg1, Msg2]: Msg1 = PartA U PartB(sin el ENTER), Msg2 = (incluido el ENTER)Msg2

// RequestA, RequestB> [ResponseA, ResponseB]
// RequestA, RequestB> [ResponseB, ResponseA]
// Esperar 2 Responses
