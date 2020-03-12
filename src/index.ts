
import { readFileSync } from 'fs';
import { Socket } from 'net';
import { parse } from 'ini';

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
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    constructor(configLocation: string = 'config.ini') {
        const config = parse(readFileSync(configLocation, 'utf-8'));
        const arca = new Socket();
        arca.setEncoding('utf-8');

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
            arca.on('error', (err: NodeJS.ErrnoException) => {
                if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
                    this.retryToConnectTimeoutID = setTimeout(() => {
                        arca.connect(Number(config.arca.port), config.arca.host);
                    }, retryToConnectTimeout);
                    return;
                }
                reject(err);
            });
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

        return new Promise<Response>((
            resolve: (value: Response | PromiseLike<Response>) => void,
            reject: (reason: NodeJS.ErrnoException) => void,
        ) => {
            const processMsgs = (data: Buffer) => {
                const msg = data.toString();
                try {
                    const result = JSON.parse(msg) as Response;
                    resolve(result);
                } catch(err) {
                    arca.once('data', (extraData: Buffer) => {
                        const extraMsg = `${msg}${extraData.toString()}`;
                        try {
                            const result = JSON.parse(extraMsg) as Response;
                            resolve(result);
                        } catch(err) {
                            arca.once('data', (extraExtraData: Buffer) => {
                                const extraExtraMsg = `${extraMsg}${extraExtraData.toString()}`;
                                try {
                                    const result = JSON.parse(extraExtraMsg) as Response;
                                    resolve(result);
                                } catch(err) {
                                    console.log('gosh! this is too deep', err);
                                }
                            });
                        }
                    });
                }
            };

            arca.once('error', reject);
            arca.once('data', processMsgs);
            arca.write(`${JSON.stringify(request)}\n`);
        });
    }
}
