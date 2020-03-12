
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

    } catch(err) {
        fail(err);
    }
});

test('Send a second simple request', async () => {
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
                    resolve();
                } catch(err) {
                    reject(err);
                }
            }, 300); // after 300ms, let's try to send a request
        });
    }
});
