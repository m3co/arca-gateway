
import { readFileSync } from 'fs';
import { Socket } from 'net';
import { parse } from 'ini';

import { Response, Request, ResponsesIterator } from './types';

const ECONNRESET = 'ECONNRESET';
const ECONNREFUSED = 'ECONNREFUSED';
const errorUnexpectedEndJSONInput = 'Unexpected end of JSON input'.toLocaleLowerCase();

const processRows = (msg: string): Response[] => {
    const rows = msg.split('\n').filter((str) => str.length > 0);
    const responses = rows.map((row: string) => {
        return JSON.parse(row) as Response;
    });
    return responses;
}

const processData = (bus: {
    processResponses: (responses: Response[]) => void,
    bufferMsg: string
}) => (data: Buffer) => {
    bus.bufferMsg += data.toString();
    try {
        const responses = processRows(bus.bufferMsg);
        bus.bufferMsg = '';
        bus.processResponses(responses);
    } catch(err) {
        const error = err as Error;
        const errorMessage = error.message.toLocaleLowerCase();
        if (errorMessage !== errorUnexpectedEndJSONInput) {
            throw error;
        }
    }
}

const prepareHandler = (): {
    handler: (data: Buffer) => void,
    getResponseByID: (ID: string) => Promise<Response>,
    getResponses: () => Promise<Response[]>,
} => {
    let callbacks: (() => void)[] = [];
    let responseQueue: Response[] = [];

    function clear(timeout: NodeJS.Timeout, currentCallback: () => void) {
        clearTimeout(timeout);
        callbacks = callbacks.filter(callback => {
            return callback !== currentCallback;
        });
    }

    const getResponseByID = (ID: string): Promise<Response> => {
        return new Promise<Response>((
            resolve: (value: Response | PromiseLike<Response>) => void,
            reject: (reason: Error) => void,
        ) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout at getResponseByID('${ID}')`));
            }, 1000);
            const callback = () => {
                responseQueue = responseQueue.filter((response: Response): boolean => {
                    if (response.ID === ID) {
                        resolve(response);
                        clear(timeout, callback);
                        return false;
                    }
                    return true;
                });
            };
            callbacks.push(callback);
        });
    }

    const getResponses = (): Promise<Response[]> => {
        return new Promise<Response[]>((
            resolve: (value: Response[] | PromiseLike<Response[]>) => void,
        ) => {
            resolve([...responseQueue]);
            responseQueue.length = 0;
        });
    }

    return {
        handler: processData({
            processResponses: (responses: Response[]): void => {
                responseQueue.push(...responses);
                callbacks.forEach(callback => callback());
            },
            bufferMsg: ''
        }),
        getResponseByID,
        getResponses,
    }
}

export class Arca {
    private arca: Socket;
    private retryToConnectTimeoutID: NodeJS.Timeout | null = null;
    private getResponseByID: ((ID: string) => Promise<Response>) | null = null;
    private getResponses: (() => Promise<Response[]>) | null = null;

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
    request(request: Request): Promise<Response> {
        const { arca } = this;
        return new Promise<Response>(async (
            resolve: (value: Response | PromiseLike<Response>) => void,
            reject: (reason: NodeJS.ErrnoException) => void,
        ) => {
            arca.once('error', reject);
            arca.write(`${JSON.stringify(request)}\n`);

            try {
                if (this.getResponseByID) {
                    const response = await this.getResponseByID(request.ID);
                    resolve(response);
                } else {
                    reject(new Error('getResponseByID undefined'));
                }
            } catch(err) {
                reject(err);
            }
        });
    }

    async *responses(): ResponsesIterator {
        if (this.getResponses) {
            while (true) {
                yield this.getResponses();
            }
        }
        return Promise.reject(new Error('getResponses undefined'));
    }
}
