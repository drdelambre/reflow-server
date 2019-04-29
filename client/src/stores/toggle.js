import { Cache } from 'syme';
import { grab as grabPrefix } from 'stores/prefix';

class ToggleCache extends Cache {
    constructor(prefix) {
        super({
            key: `toggle-${prefix}`,
            channel: 'local',
            expiration: 3 * 60 * 60 * 1000
        });
    }
}

export function grab() {
    return new Promise((resolve, reject) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new ToggleCache(prefix);

                if (cache.cached) {
                    resolve(cache.cached.status);
                    return;
                }

                // TODO: resolve with a fetch after
                // redis store is complete (dd)
                resolve(false);
            })
            .catch((e) => { reject(e) });
    });
}

export function populate(status) {
    return new Promise((resolve, reject) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new ToggleCache(prefix);

                cache.populate({ status: status });
                resolve(status);
            })
            .catch((e) => { reject(e) });
    });
}

export function watch(cb) {
    return new Promise((resolve, reject) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new ToggleCache(prefix);

                resolve(cache.watch((data) => {
                    cb(data.status);
                }));
            })
            .catch((e) => { reject(e) });
    });
}
