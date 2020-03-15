
import { readFileSync } from 'fs';
import { Socket } from 'net';
import { parse } from 'ini';

const ECONNRESET = 'ECONNRESET';
const ECONNREFUSED = 'ECONNREFUSED';
const errorUnexpectedEndJSONInput = 'Unexpected end of JSON input'.toLocaleLowerCase();

export interface Response {
    ID: string;
    Context: {
        Source: string;
        Target: string;
        Notification: true;
    };
    Result: {
        [key: string]: string;
    };
    Error: {
        Code: number;
        Message: string;
    } | null
}

export interface Request {
    ID: string,
    Method: string,
    Context: {
        [key:string]: string;
    }
}

export class Arca {
    private arca: Socket;
    private retryToConnectTimeoutID: NodeJS.Timeout | null = null;
    private responseQueue: Response[] = [];
    private bufferMsg: string = '';
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    constructor(configLocation: string = 'config.ini') {
        const config = parse(readFileSync(configLocation, 'utf-8'));
        const arca = new Socket();
        arca.setEncoding('utf-8');
        arca.on('data', this.processData);

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

    private static processRows = (msg: string): Response[] => {
        const rows = msg.split('\n').filter((str) => str.length > 0);
        const responses = rows.map((row: string) => {
            return JSON.parse(row) as Response;
        });
        return responses;
    }

    // processData turns the data comming from Arca into Responses
    private processData = (data: Buffer) => {
        const msg = data.toString();
        this.bufferMsg += msg;
        try {
            const responses = Arca.processRows(this.bufferMsg);
            this.bufferMsg = '';
            this.responseQueue.push(...responses);
        } catch(err) {
            const error = err as Error;
            const errorMessage = error.message.toLocaleLowerCase();
            if (errorMessage !== errorUnexpectedEndJSONInput) {
                throw error;
            }
        }
    }

    getResponses(): Response[] {
        return [...this.responseQueue];
    }

    // send the request to Arca
    request(request: Request): Promise<Response> {
        const { arca } = this;
        const { ID } = request;

        return new Promise<Response>((
            resolve: (value: Response | PromiseLike<Response>) => void,
            reject: (reason: NodeJS.ErrnoException) => void,
        ) => {
            const searchResponse = () => {
                const filtred = this.responseQueue.filter((response: Response): boolean => {
                    if (response.ID === ID) {
                        resolve(response);
                        arca.off('data', searchResponse);
                        return false;
                    }
                    return true;
                });
                this.responseQueue = filtred;
            }

            arca.on('data', searchResponse);
            arca.once('error', reject);
            arca.write(`${JSON.stringify(request)}\n`);
        });
    }
}
