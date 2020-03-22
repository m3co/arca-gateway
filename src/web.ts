
import { readFileSync } from 'fs';
import { parse } from 'ini';

import * as SocketIO from 'socket.io';

export class Web {
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    private io: SocketIO.Server;
    constructor(params?: {
        configLocation?: string,
    }) {
        const defaultParams = {
            configLocation: 'config.ini',
        };
        const { configLocation } = {...defaultParams, ...(params || {})};
        this.config = parse(readFileSync(configLocation, 'utf-8'));

        const io = SocketIO();
        io.on('connect', (socket: SocketIO.Socket) => {
            socket.on('jsonrpc', (req: any) => {
                socket.emit('jsonrpc', { ID: 'an-ID', Method: 'A response' });
            })
        });

        this.io = io;
    }

    listen() {
        this.io.listen(this.config.port);
    }
    close() {
        this.io.close();
    }

}
