
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
