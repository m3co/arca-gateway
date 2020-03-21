
import { Socket } from 'net';
import { ECONNRESET, ECONNREFUSED,
    errorUnexpectedEndJSONInput,
    Request, Response } from './types';

const processRows = (msg: string): Response[] => {
    const rows = msg.split('\n').filter((str) => str.length > 0);
    const responses = rows.map((row: string) => {
        return JSON.parse(row) as Response
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
        if (responses.length) {
            bus.processResponses(responses);
        }
    } catch(err) {
        const error = err as Error;
        const errorMessage = error.message.toLocaleLowerCase();
        if (errorMessage !== errorUnexpectedEndJSONInput) {
            throw error;
        }
    }
}

export const prepareHandler = (onNotification: (response: Response) => void): {
    handler: (data: Buffer) => void,
    getResponseByID: (ID: string, waitForResponseTimeout: number) => Promise<Response>,
} => {
    let callbacks: (() => void)[] = [];
    let responseQueue: Response[] = [];

    function clear(currentCallback: () => void, timeout?: NodeJS.Timeout) {
        (timeout !== undefined) && clearTimeout(timeout);
        callbacks = callbacks.filter(callback => callback !== currentCallback);
    }

    const getResponseByID = (ID: string, waitForResponseTimeout: number = 1000): Promise<Response> => {
        return new Promise<Response>((
            resolve: (value: Response | PromiseLike<Response>) => void,
            reject: (reason: Error) => void,
        ) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout at getResponseByID('${ID}')`));
            }, waitForResponseTimeout);
            const callback = () => {
                responseQueue = responseQueue.filter((response: Response): boolean => {
                    if (response.ID === ID) {
                        resolve(response);
                        clear(callback, timeout);
                        return false;
                    }
                    return true;
                });
            };
            callbacks.push(callback);
        });
    }

    return {
        handler: processData({
            processResponses: (responses: Response[]): void => {
                responses.forEach(response => {
                    if (response.ID) {
                        responseQueue.push(response);
                    } else {
                        onNotification(response);
                    }
                });
                callbacks.forEach(callback => callback());
            },
            bufferMsg: '',
        }),
        getResponseByID,
    }
}

export function defineAPI(config: {
    [key: string]: any;
}, onNotification: (response: Response) => void) {
    let retryToConnectTimeoutID: NodeJS.Timeout | null;
    const arca = new Socket();
    arca.setEncoding('utf-8');

    const bus = prepareHandler(onNotification);
    arca.on('data', bus.handler);

    const connect = (retryToConnectTimeout: number = 1000): Promise<void> => {
        return new Promise<void>((
            resolve: () => void,
            reject: (reason: NodeJS.ErrnoException) => void
        ) => {
            const processError = (err: NodeJS.ErrnoException) => {
                if (err.code === ECONNREFUSED || err.code === ECONNRESET) {
                    retryToConnectTimeoutID = setTimeout(() => {
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
    };

    const disconnect = () => {
        if (retryToConnectTimeoutID) {
            clearTimeout(retryToConnectTimeoutID);
            retryToConnectTimeoutID = null;
        }
        arca.end();
    };

    const request = (request: Request, waitForResponseTimeout: number = 1000): Promise<Response> => {
        return new Promise<Response>(async (
            resolve: (value: Response | PromiseLike<Response>) => void,
            reject: (reason: NodeJS.ErrnoException) => void,
        ) => {
            arca.once('error', reject);
            arca.write(`${JSON.stringify(request)}\n`);

            try {
                const response = await bus.getResponseByID(request.ID, waitForResponseTimeout);
                resolve(response);
            } catch(err) {
                reject(err);
            }
        });
    };

    return {
        connect,
        disconnect,
        request,
    }
}
