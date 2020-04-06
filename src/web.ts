
import { readFileSync } from 'fs';
import { parse } from 'ini';
import * as SocketIO from 'socket.io';
import { Server } from 'http';
import { createLogger } from 'bunyan';

import { Arca } from './arca';
import { Request, Response } from './types';

const log = createLogger({
    name: 'arca-web',
    streams: [{
        path: './arca-web.log',
    }]
});

export class Web {
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    private proxy?: Server;
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
        proxy?: Server;
        configLocation?: string;
    }) {
        const defaultParams = {
            configLocation: 'config.ini'
        };
        const { configLocation } = {...defaultParams, ...params};

        if (params.proxy) {
            this.io = SocketIO(params.proxy);
        } else {
            this.io = SocketIO();
        }
        this.config = parse(readFileSync(configLocation, 'utf-8'));
        this.arca = params.arca;
        this.proxy = params.proxy;
    };

    listen(retryToConnectTimeout: number = 1000) {
        const { arca, io, proxy, config, clients } = this;

        if (proxy) {
            proxy.listen(config.port)
        } else {
            io.listen(config.port);
        }

        const doit = {
            'Subscribe': function(id: string, params: {Source?: string, Target?: string}) {
                if (params.Source) {
                    clients[id].Sources.push(params.Source);
                }
                if (params.Target) {
                    clients[id].Targets.push(params.Target);
                }
            },
            'Unsubscribe': function(id: string, params: {Source?: string, Target?: string}) {
                if (params.Source) {
                    clients[id].Sources = clients[id].Sources.filter(source =>
                        source !== params.Source);
                }
                if (params.Target) {
                    clients[id].Targets = clients[id].Targets.filter(target =>
                        target !== params.Target);
                }
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
                    if ((request.Method === 'Subscribe') ||
                        (request.Method === 'Unsubscribe')) {
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
                    try {
                        const response = await arca.request(request);
                        socket.emit('jsonrpc', response);
                    } catch(err) {
                        const error = err as Error;
                        log.error({
                            request,
                            location: 'Web.on:jsonrpc.request',
                            error,
                        })
                    }
                } else {
                    const responseError = {
                        Method: 'socket.on::jsonrpc',
                        Error: {
                            Code: -32700,
                            Message: 'Parse error',
                        }
                    };
                    log.error({
                        request,
                        location: 'Web.on:jsonrpc.checkRequest',
                        responseError,
                    });
                    socket.emit('jsonrpc', responseError);
                }
            });

            socket.on('disconnect', () => {
                delete clients[socket.id];
            });
        });

        return arca.connect(retryToConnectTimeout);
    };

    close() {
        const { arca, io, proxy } = this;
        if (proxy) {
            proxy.close()
        } else {
            io.close();
        }
        arca.disconnect();
    };

}
