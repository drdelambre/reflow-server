import { grab as token } from 'stores/token';

export function authFetch(url, options = {}) {
    return token().then((_token) => {
        if (!options.hasOwnProperty('headers')) {
            options.headers = new Headers();
        }

        options.headers.append('x-access-token', _token);

        return fetch(url, options);
    });
}
