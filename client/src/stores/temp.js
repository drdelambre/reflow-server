import { Cache } from 'syme';
import {
    grab as grabPrefix,
    watch as watchPrefix
} from 'stores/prefix';

const MAX_ENTRIES = 800;

class TempCache extends Cache {
    constructor(prefix) {
        super({
            key: `temp-get-${prefix}`,
            channel: 'memory',
            expiration: 5 * 60 * 1000
        });
    }
}

export function grab() {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new TempCache(prefix);

                if (cache.cached) {
                    resolve(cache.cached);
                    return;
                }

                resolve([]);
            });
    });
}

export function push(entry) {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new TempCache(prefix);

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
        let _remove,
            _watchRemove;

        grabPrefix()
            .then((prefix) => {
                const cache = new TempCache(prefix);

                _remove = cache.watch((data) => {
                    cb(data);
                });
            });

        _watchRemove = watchPrefix((prefix) => {
            if (_remove) {
                _remove.remove();
                _remove = null;
            }

            const cache = new TempCache(prefix);

            _remove = cache.watch((data) => {
                cb(data);
            });
        });

        resolve({
            remove: () => {
                if (_remove) {
                    _remove.remove();
                    _remove = null;
                }

                if (_watchRemove) {
                    console.log(_watchRemove);
                    _watchRemove.remove();
                    _watchRemove = null;
                }
            }
        });
    });
}
