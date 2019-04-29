import { Cache } from 'syme';
import {
    grab as grabPrefix,
    watch as watchPrefix
} from 'stores/prefix';
import {
    grab as grabWorkflow,
    watch as watchWorkflow
} from 'stores/workflow';
import {
    connect
} from 'stores/socket';

class ControlCache extends Cache {
    static initial = {
        playing: false,
        current: 0,
        steps: []
    };

    constructor(prefix) {
        super({
            key: `control-${prefix}`,
            channel: 'local',
            expiration: 12 * 60 * 60 * 1000
        });
    }
}

// global observer to always keep in sync with the workflow
watchWorkflow((steps) => {
    grab()
        .then((data) => {
            data.steps = steps;

            update(data);
        });
});

function toPromiseChain(steps) {
    let ret = new Promise((resolve) => {
        resolve();
    });

    for (let ni = 0; ni < steps.length; ni++) {
        switch (steps[ni].type) {
        case 'stop':
            ret = ret.then(((step, idx) => {
                return () => {
                    return new Promise((resolve) => {
                        grab()
                            .then((data) => {
                                if (!data.playing) {
                                    throw new Error('break');
                                }
                                return update({ current: idx });
                            })
                            .then(() => {
                                return connect();
                            })
                            .then((ws) => {
                                grabPrefix()
                                    .then((prefix) => {
                                        const msg = (evt) => {
                                            const _evt = JSON.parse(evt.data);

                                            if (_evt.evt !== 'temp_done') {
                                                return;
                                            }

                                            resolve();

                                            ws.removeEventListener('message', msg);
                                        };

                                        ws.send(JSON.stringify({
                                            evt: 'set_temp',
                                            prefix: prefix,
                                            data: parseFloat(steps[ni].value)
                                        }));

                                        ws.addEventListener('message', msg);
                                    });
                            });
                    });
                };
            })(steps[ni], ni));
            break;
        case 'dwell':
            ret = ret.then(((step, idx) => {
                return () => {
                    return new Promise((resolve) => {
                        grab()
                            .then((data) => {
                                if (!data.playing) {
                                    throw new Error('break');
                                }

                                return update({ current: idx });
                            })
                            .then(() => {
                                setTimeout(() => {
                                    resolve();
                                }, Math.floor(parseFloat(step.value) * 1000));
                            });
                    });
                };
            })(steps[ni], ni));
            break;
        default:
            break;
        }

        if (ni === steps.length - 1) {
            ret = ret.then(() => {
                update({
                    playing: false,
                    current: 0
                });
            }).catch(() => {});
        }
    }

    return ret;
}

export function grab() {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new ControlCache(prefix);

                if (cache.cached) {
                    resolve(cache.cached);
                    return;
                }

                grabWorkflow()
                    .then((steps) => {
                        resolve(Object.assign({}, ControlCache.initial, {
                            steps: steps
                        }));
                    });
            });
    });
}

export function update(data) {
    return new Promise((resolve) => {
        grabPrefix()
            .then((prefix) => {
                const cache = new ControlCache(prefix);

                cache.populate(Object.assign({}, cache.cached, data));

                resolve();
            });
    });
}

export function start() {
    return grab()
        .then((data) => {
            if (data.playing) {
                return;
            }

            data.playing = true;

            update(data);

            return toPromiseChain(data.steps);
        });
}

export function stop() {
    return grab()
        .then((data) => {
            if (!data.playing) {
                return;
            }

            data.playing = false;
            data.current = 0;

            update(data);
        });
}

export function watch(cb) {
    return new Promise((resolve) => {
        let _remove,
            _watchRemove;

        grabPrefix()
            .then((prefix) => {
                const cache = new ControlCache(prefix);

                _remove = cache.watch((data) => {
                    cb(data);
                });
            });

        watchPrefix((prefix) => {
            if (_remove) {
                _remove.remove();
                _remove = null;
            }

            const cache = new ControlCache(prefix);

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
