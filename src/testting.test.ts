
import { arca, Response } from './index';
import { v4 as uuidv4 } from 'uuid';

test('Testing a simple connection', async () => {

    const id = uuidv4();
    const fn = (
        resolve: (value: Response | PromiseLike<Response>) => void,
        reject: (reason: Error) => void
        ) => {
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

        arca.on('error', (error: Error) => {
            reject(error);
        });
    
        arca.connect(2234, 'localhost');
    };

    const t = new Promise<Response>(fn);

    const response = await t;
    expect(response.ID).toBe(id);
});
