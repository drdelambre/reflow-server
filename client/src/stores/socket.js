import { PromiseCache } from 'stores/util';

let socket;

const CONNECT_CACHE = PromiseCache();

export function connect() {
    return new Promise((resolve) => {
        if (socket) {
            resolve(socket);
            return;
        }

        CONNECT_CACHE(resolve);

        if (CONNECT_CACHE.active) {
            return;
        }

        CONNECT_CACHE.active = true;

        const _socket = new WebSocket(`ws://${window.location.host}/api/`);

        _socket.addEventListener('open', () => {
            socket = _socket;

            CONNECT_CACHE.fire(_socket);
        });
    });
}
