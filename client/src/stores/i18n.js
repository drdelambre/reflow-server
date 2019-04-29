import { Cache } from 'syme';
import { PromiseCache } from 'stores/util';

class I18nStore extends Cache {
    constructor(i18n, module) {
        super({
            key: `msgs_${module}_${i18n}`,
            channel: 'session',
            expires: 4 * 60 * 60 * 1000
        });
    }
}

const GRAB_CACHE = {};

export function grab(i18n, module) {
    return new Promise((resolve, reject) => {
        if (i18n === 'en') {
            // already cached in the view layer
            resolve({
                i18n: 'en',
                text: {}
            });

            return;
        }

        const cache = new I18nStore(i18n, module);

        if (cache.cached) {
            resolve(cache.cached);
            return;
        }

        if (!GRAB_CACHE.hasOwnProperty(module)) {
            GRAB_CACHE[module] = new PromiseCache();
        }

        GRAB_CACHE[module](resolve);

        if (GRAB_CACHE[module].active) {
            return;
        }

        GRAB_CACHE[module].active = true;

        // TODO: fetch the file po here (drdelambre)
        // GET /api/i18n  { component: Home }
        //    returns { i18n, text } in case component isn't translated

        const data = {
            i18n: 'en',
            text: {}
        };

        cache.populate(data);
        GRAB_CACHE[module].fire(data);
        delete GRAB_CACHE[module];
    });
}
