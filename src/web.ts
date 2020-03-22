
import { readFileSync } from 'fs';
import { parse } from 'ini';
import * as SocketIO from 'socket.io';

import { Arca } from './arca';

export class Web {
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    private io: SocketIO.Server;
    private arca: Arca;
    constructor(params: {
        arca: Arca;
        configLocation?: string,
    }) {
        const defaultParams = {
            configLocation: 'config.ini',
        };
        const { configLocation } = {...defaultParams, ...params};
        this.config = parse(readFileSync(configLocation, 'utf-8'));
        this.arca = params.arca;

        const io = SocketIO();
        io.on('connect', (socket: SocketIO.Socket) => {
            socket.on('jsonrpc', (req: any) => {
                socket.emit('jsonrpc', { ID: req.ID, Method: 'A response' });
            })
        });

        this.io = io;
    };

    request() {

    }

    listen() {
        this.io.listen(this.config.port);
    };

    close() {
        this.io.close();
    };

}
