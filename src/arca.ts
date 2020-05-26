
import { readFileSync } from 'fs';
import { parse } from 'ini';

import { Response, Notification, Request } from './types';
import { log, defineAPI } from './arca-utils';

export class Arca {
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    public connect: (retryToConnectTimeout?: number) => Promise<void>;
    public disconnect: () => void;
    public request: (request: Request, waitForResponseTimeout?: number) => Promise<Response>;
    public onNotification: (notification: Notification) => void

    constructor(params?: {
        configLocation?: string,
        onNotification?: (notification: Notification) => void,
    }) {
        const defaultParams = {
            configLocation: 'config.ini',
            onNotification: (notification: Notification): void => { log.error('onNotification not defined'); }
        };

        const { configLocation, onNotification } = {...defaultParams, ...(params || {})};
        this.config = parse(readFileSync(configLocation, 'utf-8'));
        const API = defineAPI(this.config, this);
        this.onNotification = onNotification;
        this.connect = API.connect;
        this.disconnect = API.disconnect;
        this.request = API.request;
    }

}
