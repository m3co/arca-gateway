
import { readFileSync } from 'fs';
import { Socket } from 'net';
import { parse } from 'ini';

import { ECONNRESET, ECONNREFUSED, Response, Request } from './types';
import { prepareHandler } from './arca-utils';

export class Arca {
    private arca: Socket;
    private retryToConnectTimeoutID: NodeJS.Timeout | null = null;
    private getResponseByID: ((ID: string, waitForResponseTimeout: number) => Promise<Response>) = () =>
        Promise.reject(new Error('define getResponseByID internally'));
    private getResponses: ((waitForResponseTimeout: number) => Promise<Response[]>) = () =>
        Promise.reject(new Error('define getResponses internally'));

    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    constructor(configLocation: string = 'config.ini') {
        const config = parse(readFileSync(configLocation, 'utf-8'));
        const arca = new Socket();
        arca.setEncoding('utf-8');
        const bus = prepareHandler();
        this.getResponseByID = bus.getResponseByID;
        this.getResponses = bus.getResponses;
        arca.on('data', bus.handler);

        this.arca = arca;
        this.config = config;
    }

    // conectarse a la plataforma arca
    connect(retryToConnectTimeout: number = 1000): Promise<void> {
        const { config, arca } = this;

        return new Promise<void>((
            resolve: () => void,
            reject: (reason: NodeJS.ErrnoException) => void
        ) => {
            const processError = (err: NodeJS.ErrnoException) => {
                if (err.code === ECONNREFUSED || err.code === ECONNRESET) {
                    this.retryToConnectTimeoutID = setTimeout(() => {
                        arca.once('error', processError);
                        arca.connect(Number(config.arca.port), config.arca.host);
                    }, retryToConnectTimeout);
                    return;
                }
                reject(err);
            };

            arca.once('error', processError);
            arca.once('error', reject);
            arca.once('connect', resolve);
            arca.connect(Number(config.arca.port), config.arca.host);
        });
    }

    // desconectarse
    disconnect() {
        if (this.retryToConnectTimeoutID) {
            clearTimeout(this.retryToConnectTimeoutID);
            this.retryToConnectTimeoutID = null;
        }
        this.arca.end();
    }

    // send the request to Arca
    request(request: Request, waitForResponseTimeout: number = 1000): Promise<Response> {
        const { arca, getResponseByID } = this;
        return new Promise<Response>(async (
            resolve: (value: Response | PromiseLike<Response>) => void,
            reject: (reason: NodeJS.ErrnoException) => void,
        ) => {
            arca.once('error', reject);
            arca.write(`${JSON.stringify(request)}\n`);

            try {
                if (getResponseByID) {
                    const response = await getResponseByID(request.ID, waitForResponseTimeout);
                    resolve(response);
                } else {
                    reject(new Error('getResponseByID undefined'));
                }
            } catch(err) {
                reject(err);
            }
        });
    }

    async *responses(waitForResponseTimeout: number = 1000) {
        const { getResponses } = this;
        while (true) {
            for (const response of await getResponses(waitForResponseTimeout)) {
                yield response;
            }
        }
    }
}
