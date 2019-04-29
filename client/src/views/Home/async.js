import React from 'react';
import Loadable from 'react-loadable';
import {
    IntlProvider,
    addLocaleData
} from 'react-intl';
import en from 'react-intl/locale-data/en';
import { parsedToken as token } from 'stores/token';
import { grab as language } from 'stores/i18n';

addLocaleData([...en]);

// NOTE: this demonstrates how to fetch language files
// in practice, this should be scoped at the widget level
// and not the page or component level (drdelambre)
export default Loadable({
    loader: () => import(/* webpackPreload: true */ './index')
        .then((resp) => {
            console.log('neat');
            return token()
                .then((_token) => {
                    return {
                        i18n: _token.i18n,
                        module: resp.default
                    };
                });
        })
        .then((resp) => {
            return language(resp.i18n, 'Home')
                .then((lang) => {
                    return {
                        i18n: lang.i18n,
                        module: resp.module,
                        text: lang.text
                    };
                });
        })
        .then((resp) => {
            return () => {
                return (
                    <IntlProvider locale={ resp.i18n }
                        messages={ resp.text }>
                        { React.createElement(resp.module) }
                    </IntlProvider>
                );
            };
        }),
    loading: () => null
});
