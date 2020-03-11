
import { Response } from './index';
import { v4 as uuidv4 } from 'uuid';

test('Reconnect', async (done: jest.DoneCallback) => {
    const { config, createInstance } = await import('./index');
    config.arca.host = 'localhost';
    config.arca.port = 22345;
    const arca = createInstance();

    config.arca.port = 1;
    let i = 0;
    const id = uuidv4();

    const promise = new Promise<Response>((
        resolve: (value: Response | PromiseLike<Response>) => void,
        reject: (reason: Error) => void
    ) => {
        arca.on('error', (error: Error) => {
            reject(error);
            i++;
            if (i == 2) {
                expect(config.arca.retryToConnectTimeoutID).toBeDefined();
                clearTimeout(config.arca.retryToConnectTimeoutID);
                done();
            } else if (i > 2) {
                fail(new Error('Unexpected execution'));
            }
        });

        arca.connect(config.arca.port, config.arca.host);
    });
    try {
        await promise;
        fail(new Error('Unexpected execution'));
    } catch(e) {
        const err = e as NodeJS.ErrnoException;
        expect(err.code).toBe('ECONNREFUSED');
    }
});

test('Send a first simple request', async (done: jest.DoneCallback) => {
    const { config, createInstance } = await import('./index');
    config.arca.host = 'localhost';
    config.arca.port = 22345;
    const arca = createInstance();

    const id = uuidv4();

    arca.on('error', (err: Error) => {
        throw err;
    });

    arca.on('data', (data: Buffer) => {
        const result = JSON.parse(data.toString()) as Response;
        expect(result.ID).toBe(id);
        arca.end();
        done();
    });

    arca.connect({
        port: config.arca.port,
        host: config.arca.host,
    }, () => {
        const request = {
            ID: id,
            Method: 'test',
            Context: {
                Source: 'test-source'
            }
        }
        arca.write(`${JSON.stringify(request)}\n`);
    });
});
