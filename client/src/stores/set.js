import { Cache } from 'syme';
import { grab as grabPrefix } from 'stores/prefix';

const MAX_AGE = 5 * 60 * 1000;

class SetCache extends Cache {
    constructor(prefix) {
        super({
            key: 'temp-set',
            channel: 'session',
            expiration: 3 * 60 * 60 * 1000
        });
    }
}

export function grab() {
    return new Promise((resolve, reject) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new SetCache(prefix);

                if (cache.cached) {
                    resolve(cache.cached);
                    return;
                }

                // TODO: resolve with a fetch after
                // redis store is complete (dd)
                resolve([]);
            });
    });
}

export function push(entry) {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new SetCache(prefix);

                let arr = [],
                    now = new Date(),
                    ni = 0;

                if (cache.cached) {
                    arr = cache.cached.slice(0);
                }

                arr.push(entry);

                while (ni < arr.length) {
                    if (now - new Date(arr[ni].t) < MAX_AGE) {
                        arr = arr.slice(ni);
                        break;
                    }
                    ni++;
                }

                cache.populate(arr);
                resolve(arr);
            });
    });
}

export function watch(cb) {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new SetCache(prefix);

                resolve(cache.watch((data) => {
                    cb(data);
                }));
            });
    });
}
