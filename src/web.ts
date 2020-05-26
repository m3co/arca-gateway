
import { readFileSync } from 'fs';
import { parse } from 'ini';
import * as SocketIO from 'socket.io';
import { Server } from 'http';
import { createLogger } from 'bunyan';

import { Arca } from './arca';
import { Request, Notification, PK } from './types';
import { canSendNotification } from './web-utils';

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
            Sources: {
                [key: string]: {
                    filter: PK,
                }
            },
            Targets: {
                [key: string]: {
                    filter: PK,
                }
            }
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
        this.arca.onNotification = this.onNotificationFromArca;
    };

    subscribe = (id: string, params: {Source?: string, Target?: string}) => {
        const { clients } = this;
        if (params.Source) {
            if (!clients[id].Sources[params.Source]) {
                clients[id].Sources[params.Source] = {
                    filter: {}
                };
            }
        }
        if (params.Target) {
            if (!clients[id].Targets[params.Target]) {
                clients[id].Targets[params.Target] = {
                    filter: {}
                };
            }
        }
    }

    unsubscribe = (id: string, params: {Source?: string, Target?: string}) => {
        const { clients } = this;
        if (params.Source) {
            delete clients[id].Sources[params.Source];
        }
        if (params.Target) {
            delete clients[id].Targets[params.Target];
        }
    }

    onNotificationFromArca = (notification: Notification) => {
        const { clients } = this;
        Object.values(clients).forEach(client => {
            let foundFilter: PK | null = null;
            if (notification.Context) {
                if (notification.Context.Source) {
                    if (client.Sources[notification.Context.Target]) {
                        foundFilter = client.Sources[notification.Context.Target].filter;
                    }
                } else if (notification.Context.Target) {
                    if (client.Targets[notification.Context.Source]) {
                        foundFilter = client.Targets[notification.Context.Source].filter;
                    }
                }
            }
            if (foundFilter) {
                if (canSendNotification(foundFilter, notification.PK)) {
                    client.socket.emit('jsonrpc', notification);
                }
            }
        });
    }

    processSubscribeUnsubscribe = (socket: SocketIO.Socket, request: Request): boolean => {
        const { subscribe, unsubscribe } = this;
        const subunsub = {
            'Subscribe': subscribe,
            'Unsubscribe': unsubscribe,
        }
        if ((request.Method === 'Subscribe') ||
            (request.Method === 'Unsubscribe')) {
            if (request.Params) {
                const response = {
                    ID: request.ID,
                    Method: request.Method,
                    Context: {...request.Params},
                    Result: true,
                };
                subunsub[request.Method](socket.id, request.Params);
                socket.emit('jsonrpc', response);
            } else {
                const responseError = {
                    ID: request.ID,
                    Method: 'socket.on::jsonrpc::processSubscribeUnsubscribe',
                    Context: request.Context,
                    Error: {
                        Code: -32703,
                        Message: `Request ${request.Method} must have the Params object defined at ${request.Method}`,
                    }
                };
                log.error({
                    request,
                    location: 'socket.on::jsonrpc::processSubscribeUnsubscribe',
                    responseError,
                });
                socket.emit('jsonrpc', responseError);
            }
            return true;
        }
        return false;
    }

    processSelect = (socket: SocketIO.Socket, request: Request): boolean => {
        const { clients } = this;
        if (request.Method === 'Select') {
            if (!request.Params) request.Params = {};
            const filter = request.Params["PK"] || {};
            const source = request.Context["Source"];
            if (source) {
                clients[socket.id].Sources[source] = { filter };
                return false; // let ARCA to process this request
            } else {
                const responseError = {
                    ID: request.ID,
                    Method: 'socket.on::jsonrpc::processSelect::filter',
                    Context: request.Context,
                    Error: {
                        Code: -32703,
                        Message: `Select requires a Source in the Context`,
                    }
                };
                log.error({
                    request,
                    location: 'socket.on::jsonrpc::processSelect::filter',
                    responseError,
                });
                socket.emit('jsonrpc', responseError);
            }
            return true;
        }
        return false;
    }

    processRequestInArca = async (socket: SocketIO.Socket, request: Request) => {
        const { arca } = this
        try {
            const response = await arca.request(request);
            socket.emit('jsonrpc', response);
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
            };
            log.error({
                request,
                location: 'socket.on::jsonrpc::processRequestInArca',
                responseError,
            });
            socket.emit('jsonrpc', responseError);
            return false;
        }
        return true;
    }

    processRequest = (socket: SocketIO.Socket) => async (request: Request) => {
        const { processSelect, processSubscribeUnsubscribe, processRequestInArca } = this;
        if (request instanceof Object) {
            processSelect(socket, request) ||
            processSubscribeUnsubscribe(socket, request) ||
            processRequestInArca(socket, request);
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
                location: 'socket.on:jsonrpc.checkRequest',
                responseError,
            });
            socket.emit('jsonrpc', responseError);
        }
    }

    listen(retryToConnectTimeout: number = 1000) {
        const { arca, io, proxy, config, clients, processRequest } = this;

        if (proxy) {
            proxy.listen(config.port)
        } else {
            io.listen(config.port);
        }

        io.on('connect', (socket: SocketIO.Socket) => {
            clients[socket.id] = {
                socket,
                Sources: {},
                Targets: {},
            };
            socket.on('jsonrpc', processRequest(socket));
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
