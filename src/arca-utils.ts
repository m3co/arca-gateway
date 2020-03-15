
import { Response, errorUnexpectedEndJSONInput } from './types';

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

export const prepareHandler = (waitForResponseTimeout: number = 1000): {
    handler: (data: Buffer) => void,
    getResponseByID: (ID: string) => Promise<Response>,
    getResponses: () => Promise<Response[]>,
} => {
    let callbacks: (() => void)[] = [];
    let responseQueue: Response[] = [];

    function clear(timeout: NodeJS.Timeout, currentCallback: () => void) {
        clearTimeout(timeout);
        callbacks = callbacks.filter(callback => callback !== currentCallback);
    }

    const getResponseByID = (ID: string): Promise<Response> => {
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
            reject: (reason: Error) => void,
        ) => {
            if (responseQueue.length) {
                resolve([...responseQueue]);
                responseQueue.length = 0;
            } else {
                const timeout = setTimeout(() => {
                    reject(new Error(`Timeout at getResponses()`));
                }, waitForResponseTimeout);
                const callback = () => {
                    resolve([...responseQueue]);
                    responseQueue.length = 0;
                    clear(timeout, callback);
                };
                callbacks.push(callback);
            }
        });
    }

    return {
        handler: processData({
            processResponses: (responses: Response[]): void => {
                responseQueue.push(...responses);
                callbacks.forEach(callback => callback());
            },
            bufferMsg: '',
        }),
        getResponseByID,
        getResponses,
    }
}
