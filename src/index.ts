
import { readFileSync } from 'fs';
import { Socket } from 'net';
import { parse } from 'ini';

export const config = parse(readFileSync('config.ini', 'utf-8'));

export interface Response {
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

export const arca = new Socket();
arca.setEncoding('utf-8');
