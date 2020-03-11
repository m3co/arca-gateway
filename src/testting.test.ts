
import { Response } from './index';
import { v4 as uuidv4 } from 'uuid';

test('Reconnect', async (done: jest.DoneCallback) => {
    const { config, arca } = await import('./index');

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

        config.arca.port = 1;
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

/*
arca.on('data', (data: Buffer) => {
    const result = JSON.parse(data.toString()) as Response;
    resolve(result);
    arca.end();
});

arca.on('connect', (had_error: boolean): void => {
    if (had_error) {
        reject(new Error('Error when connecting'));
        return;
    }
    const request = {
        ID: id,
        Method: 'test',
        Context: {
            Source: 'test-source'
        }
    }
    arca.write(`${JSON.stringify(request)}\n`);
});
*/
