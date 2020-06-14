
import { readFileSync } from 'fs';
import { parse } from 'ini';
import { createServer, Server, Socket } from 'net';
import { createLogger } from 'bunyan';

import { Arca } from './arca';
import { Request, Response } from './types';

const log = createLogger({
    name: 'arca-facad',
    streams: [{
        path: './arca-facad.log',
    }]
});

export class FACAD {
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    private facad: Server;
    private arca: Arca;
    constructor(params: {
        arca: Arca;
        configLocation?: string;
    }) {
        const defaultParams = {
            configLocation: 'config.ini'
        };
        const { configLocation } = {...defaultParams, ...params};

        this.facad = createServer((conn) => {
            conn.on('data', (data: Buffer) => {
                const dataStr = data.toString();
                try {
                    const request = JSON.parse(dataStr) as Request;
                    this.processRequestInArca(conn, request);
                } catch(err) {
                    const error = err as Error;
                    log.error({
                        dataStr,
                        location: 'socket.on:jsonrpc.request',
                        error,
                    });

                    const responseError = {
                        ID: '',
                        Method: 'socket.on::jsonrpc::processRequestInArca',
                        Context: {},
                        Error: {
                            Code: -32705,
                            Message: error.message,
                        },
                    } as Response;
                    log.error({
                        dataStr,
                        location: 'socket.on::jsonrpc::processRequestInArca',
                        responseError,
                    });
                    this.write(conn, responseError);
                }
            });
            conn.on('error', (err: Error) => {
                log.error(err);
            });
            conn.on('timeout', () => {
                log.error(new Error('Connection terminated because of timeout'));
                conn.destroy();
            });
        });

        this.facad.on('error', (err: Error) => {
            log.error(err);
            this.facad.close();
        })

        this.config = parse(readFileSync(configLocation, 'utf-8'));
        this.arca = params.arca;
    };

    processRequestInArca = async (socket: Socket, request: Request) => {
        const { arca } = this
        try {
            const response = await arca.request(request);
            this.write(socket, response);
        } catch(err) {
            const error = err as Error;
            log.error({
                request,
                location: 'socket.on:jsonrpc.request',
                error,
            });

            const responseError = {
                ID: request.ID,
                Method: 'socket.on::jsonrpc::processRequestInArca',
                Context: request.Context,
                Error: {
                    Code: -32705,
                    Message: error.message,
                }
            } as Response;
            log.error({
                request,
                location: 'socket.on::jsonrpc::processRequestInArca',
                responseError,
            });
            this.write(socket, responseError);
        }
    }

    write(socket: Socket, response: Response) {
        socket.write(JSON.stringify(response) + '\n', 'utf-8');
    }

    listen() {
        const { config } = this;
        this.facad.listen(Number(config.facad.port), config.facad.host);
    }
}
