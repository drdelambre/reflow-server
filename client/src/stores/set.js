import { Cache } from 'syme';
import { grab as grabPrefix } from 'stores/prefix';

const MAX_ENTRIES = 120;

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
                let arr = [];

                if (cache.cached) {
                    arr = cache.cached.slice(0);
                }

                arr.push(entry);

                if (arr.length > MAX_ENTRIES) {
                    arr = arr.slice(arr.length - MAX_ENTRIES);
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
