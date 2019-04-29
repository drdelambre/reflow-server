import { Cache } from 'syme';
import {
    grab as grabPrefix,
    watch as watchPrefix
} from 'stores/prefix';

class WorkflowCache extends Cache {
    constructor(prefix) {
        super({
            key: `workflow-${prefix}`,
            channel: 'local',
            expiration: 5 * 60 * 60 * 1000
        });
    }
}

export function grab() {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new WorkflowCache(prefix);

                if (cache.cached) {
                    resolve(cache.cached);
                    return;
                }

                resolve([]);
            });
    });
}

export function push(data) {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new WorkflowCache(prefix);
                let arr = [];

                if (cache.cached) {
                    arr = cache.cached.slice(0);
                }

                arr.push(data);
                cache.populate(arr);

                resolve(arr);
            });
    });
}

export function update(index, data) {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new WorkflowCache(prefix);
                let arr = [];

                if (cache.cached) {
                    arr = cache.cached.slice(0);
                }

                arr[index] = data;
                cache.populate(arr);

                resolve(arr);
            });
    });
}

export function remove(index) {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new WorkflowCache(prefix);
                let arr = [];

                if (cache.cached) {
                    arr = cache.cached.slice(0);
                }

                arr.splice(index, 1);
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
                const cache = new WorkflowCache(prefix);

                _remove = cache.watch((data) => {
                    cb(data);
                });
            });

        watchPrefix((prefix) => {
            if (_remove) {
                _remove.remove();
                _remove = null;
            }

            const cache = new WorkflowCache(prefix);

            _remove = cache.watch((data) => {
                cb(data);
            });
        }).then((handle) => { _watchRemove = handle });

        resolve({
            remove: () => {
                if (_remove) {
                    _remove.remove();
                    _remove = null;
                }

                if (_watchRemove) {
                    _watchRemove.remove();
                    _watchRemove = null;
                }
            }
        });
    });
}
