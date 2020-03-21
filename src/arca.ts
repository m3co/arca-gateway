
import { readFileSync } from 'fs';
import { parse } from 'ini';

import { Response, Request } from './types';
import { defineAPI } from './arca-utils';

export class Arca {
    public config: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};

    public connect: (retryToConnectTimeout?: number) => Promise<void>;
    public disconnect: () => void;
    public request: (request: Request, waitForResponseTimeout?: number) => Promise<Response>;

    constructor(params?: {
        configLocation?: string,
        onNotification?: (response: Response) => void,
    }) {
        const defaultParams = {
            configLocation: 'config.ini',
            onNotification: (notification: Response) => {}
        };

        const { configLocation, onNotification } = {...defaultParams, ...(params || {})};
        this.config = parse(readFileSync(configLocation, 'utf-8'));
        const API = defineAPI(this.config, onNotification);
        this.connect = API.connect;
        this.disconnect = API.disconnect;
        this.request = API.request;
    }
}
