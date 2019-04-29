import shortid from 'shortid';

export default function Observer() {
    const cbs = {},
        maxCollisions = 20,
        ret = (cb) => {
            if (typeof cb !== 'function') {
                return;
            }

            let id = shortid.generate(),
                collisions = 0;

            while (cbs.hasOwnProperty(id)) {
                if (++collisions > maxCollisions) {
                    throw new Error('Max collisions hit in observer');
                }

                id = shortid.generate();
            }

            cbs[id] = cb;

            return {
                remove() {
                    delete cbs[id];
                }
            };
        };

    ret.fire = (...args) => {
        const keys = Object.keys(cbs);
        let ni;

        for (ni = 0; ni < keys.length; ni++) {
            cbs[keys[ni]].apply(cbs[keys[ni]], args);
        }
    };

    return ret;
}


