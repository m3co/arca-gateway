
import { readFileSync } from 'fs';
import { Socket } from 'net';

import { parse } from 'ini';
import { v4 as uuidv4 } from 'uuid';

export const config = parse(readFileSync('config.ini', 'utf-8'));

interface Response {
    ID: string;
    Context: {
        Source: string
    };
    Result: {
        [key: string]: string;
    };
    Error: {
        Code: number;
        Message: string;
    }
}

const arca = new Socket();
arca.setEncoding('utf-8');

arca.on('data', (data: Buffer) => {
    const result = JSON.parse(data.toString()) as Response;
    console.log(result);
});

arca.connect(22345, 'localhost', (): void => {
    console.log('connected');
    const request = {
        ID: uuidv4(),
        Method: 'test',
        Context: {
            Source: 'test-source'
        }
    }
    arca.write(`${JSON.stringify(request)}\n`);
});
