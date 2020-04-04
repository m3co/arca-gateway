
import { readFileSync } from 'fs';
import { parse } from 'ini';
import * as SocketIO from 'socket.io';

import { Arca } from './arca';
import { Request, Response } from './types';


export class Web {
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    private io: SocketIO.Server;
    private arca: Arca;
    private clients: {
        [key: string]: {
            socket: SocketIO.Socket,
            Sources: string[],
            Targets: string[]
        }
    } = {};
    constructor(params: {
        arca: Arca;
        configLocation?: string,
    }) {
        const defaultParams = {
            configLocation: 'config.ini',
        };
        const { configLocation } = {...defaultParams, ...params};

        this.io = SocketIO();
        this.config = parse(readFileSync(configLocation, 'utf-8'));
        this.arca = params.arca;
    };

    listen(retryToConnectTimeout: number = 1000) {
        const { arca, io, config, clients } = this;

        const doit = {
            'subscribe': function(id: string, params: {Source?: string, Target?: string}) {
                if (params.Source) {
                    clients[id].Sources.push(params.Source);
                }
                if (params.Target) {
                    clients[id].Sources.push(params.Target);
                }
            },
            'unsubscribe': function(id: string, params: {Source?: string, Target?: string}) {
                //console.log(id, 'hmmm unsubscribe', params);
            }
        }

        this.arca.onNotification = (response: Response) => {
            Object.values(clients).forEach(client => {
                if (response.Context) {
                    if (response.Context.Source) {
                        const found = client.Sources.find((source) => source === response.Context.Source);
                        if (found) {
                            client.socket.emit('jsonrpc', response);
                        }
                    }
                    if (response.Context.Target) {
                        const found = client.Targets.find((target) => target === response.Context.Target);
                        if (found) {
                            client.socket.emit('jsonrpc', response);
                        }
                    }

                }
            });
        };

        io.on('connect', (socket: SocketIO.Socket) => {
            clients[socket.id] = {
                socket,
                Sources: [],
                Targets: [],
            };
            socket.on('jsonrpc', async (request: Request) => {
                if (request instanceof Object) {
                    if ((request.Method === 'subscribe') ||
                        (request.Method === 'unsubscribe')) {
                        const response = {
                            ID: request.ID,
                            Method: request.Method,
                            Context: {...request.Params},
                            Result: true,
                        };
                        request.Params && doit[request.Method](socket.id, request.Params);
                        socket.emit('jsonrpc', response);
                        return
                    }
                    const response = await arca.request(request);
                    socket.emit('jsonrpc', response);
                } else {
                    const responseError = {
                        Method: 'socket.on::jsonrpc',
                        Error: {
                            Code: -32700,
                            Message: 'Parse error',
                        }
                    };
                    socket.emit('jsonrpc', responseError);
                }
            });

            socket.on('disconnect', () => {
                delete clients[socket.id];
            });
        });

        io.listen(config.port);
        return arca.connect(retryToConnectTimeout);
    };

    close() {
        const { arca, io } = this;
        io.close();
        arca.disconnect();
    };

}
