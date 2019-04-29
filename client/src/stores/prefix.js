import { Cache } from 'syme';

class PrefixCache extends Cache {
    constructor() {
        super({
            key: 'prefix',
            channel: 'local',
            expiration: 24 * 60 * 60 * 1000
        });
    }
}

export function grab() {
    return new Promise((resolve, reject) => {
        const cache = new PrefixCache();

        if (cache.cached) {
            resolve(cache.cached);
            return;
        }

        resolve('');
        // reject(new Error('no prefix set'));
    });
}

export function populate(str) {
    return new Promise((resolve, reject) => {
        const cache = new PrefixCache();
        cache.populate(str);
        resolve(str);
    });
}

export function watch(cb) {
    return new Promise((resolve) => {
        const cache = new PrefixCache();

        resolve(cache.watch((data) => {
            cb(data);
        }));
    });
}
