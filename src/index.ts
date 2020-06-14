
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createProxyServer } from 'http-proxy';

import { readFileSync } from 'fs';
import { parse } from 'ini';

import { Arca } from './arca';
import { Web } from './web';
import { FACAD } from './facad';

const config = parse(readFileSync('config.ini', 'utf-8'));
const staticProxy = createProxyServer();

const proxy = createServer(handler);

const arca = new Arca();
const web = new Web({ arca, proxy });
const facad = new FACAD({ arca });

web.listen();
facad.listen();

function handler(req: IncomingMessage, res: ServerResponse) {
    staticProxy.web(req, res, { target: config.static.target }, (err: Error) => {
        console.error(err);
    });
}
