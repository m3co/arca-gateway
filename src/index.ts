
import { Arca } from './arca';
import { Web } from './web';

/*
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createProxyServer } from 'http-proxy';

const staticProxy = createProxyServer();
function handler(req: IncomingMessage, res: ServerResponse) {
    staticProxy.web(req, res, { target: '' }, (err) => {
        console.error(err);
    });
}

const proxy = createServer(handler);
const io = SocketIO(proxy);
*/

const arca = new Arca();
const web = new Web({ arca });
web.listen();
