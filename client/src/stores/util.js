export function PromiseCache() {
    const cbs = [],
        ret = (cb) => {
            if (typeof cb !== 'function') {
                return;
            }

            cbs.push(cb);
        };

    ret.fire = (...args) => {
        let cb;

        while (cbs.length) {
            cb = cbs.pop();
            cb.apply(cb, args);
        }

        ret.active = false;
    };

    ret.active = false;

    return ret;
}
