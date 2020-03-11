
import { readFileSync } from 'fs';
import { Socket } from 'net';
import { parse } from 'ini';

export const config = parse(readFileSync('config.ini', 'utf-8'));
config.arca.retryToConnectTimeout = 1000;

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

void function() {
    arca.setEncoding('utf-8');
    config.arca.retryTimer = null;

    arca.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
            config.arca.retryToConnectTimeoutID = setTimeout(() => {
                //console.log('retrying to connect...');
                if (config.arca.port && config.arca.host) {
                    arca.connect(config.arca.port, config.arca.host);
                }
            }, config.arca.retryToConnectTimeout);
            return;
        }
    });

}();
