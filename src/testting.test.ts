
import { arca, Response } from './index';
import { v4 as uuidv4 } from 'uuid';

test('whatever', async () => {

    const id = uuidv4();
    const fn = (
        resolve: (value?: Response | PromiseLike<Response>) => void,
        reject: (reason?: string) => void
        ) => {
        arca.on('data', (data: Buffer) => {
            const result = JSON.parse(data.toString()) as Response;
            resolve(result);
            arca.end();
        });
    
        arca.on('connect', (had_error: boolean): void => {
            if (had_error) {
                reject('an error');
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
    
        arca.connect(22345, 'localhost');
    };

    const t = new Promise<Response>(fn);

    const response = await t;
    console.log(response);
    expect(response.ID).toBe(id);
});
