import { Cache } from 'syme';
import { PromiseCache } from 'stores/util';

class TokenCache extends Cache {
    constructor() {
        super({
            key: 'token',
            channel: 'local',
            expiration: 3 * 60 * 60 * 1000
        });
    }
}

const GRAB_CACHE = PromiseCache();

export function grab() {
    return new Promise((resolve, reject) => {
        const cache = new TokenCache();

        if (cache.cached) {
            resolve(cache.cached);
            return;
        }

        GRAB_CACHE(resolve);

        if (GRAB_CACHE.active) {
            return;
        }

        GRAB_CACHE.active = true;

        const language =
            (navigator.languages && navigator.languages[0]) ||
            navigator.language ||
            navigator.userLanguage,
            i18n = language.toLowerCase().split(/[_-]+/)[0],
            headers = new Headers({
                'x-i18n': i18n
            });

        fetch('/api/token', {
            method: 'GET',
            headers: headers
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('nope');
                }

                return response.json();
            })
            .then((data) => {
                cache.populate(data.token);

                GRAB_CACHE.fire(data.token);
            });
    });
}

export function parsedToken() {
    return grab()
        .then((token) => {
            return JSON.parse(atob(token.split('.')[1]));
        });
}
