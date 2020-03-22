
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

        this.io = SocketIO();
        this.config = parse(readFileSync(configLocation, 'utf-8'));
        this.arca = params.arca;
    };

    listen(retryToConnectTimeout: number = 1000) {
        const { arca, io, config } = this;

        io.on('connect', (socket: SocketIO.Socket) => {
            socket.on('jsonrpc', async (req: any) => {
                const response = await arca.request(req);
                socket.emit('jsonrpc', response);
            })
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
