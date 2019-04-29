const globSync = require('glob').sync,
    fs = require('fs'),
    path = require('path'),
    config = require('../webpack.config.js'),

    MESSAGES_PATTERN = path.resolve(__dirname, '../../src/messages') + '/**/*.json',

    defaultMessages = globSync(MESSAGES_PATTERN)
        .map(filename => fs.readFileSync(filename, 'utf8'))
        .map(file => JSON.parse(file))
        .reduce((collection, descriptors) => {
            descriptors.forEach(({ id, defaultMessage }) => {
                let curr = collection;

                id.split('.')
                    .forEach((module, idx, ids) => {
                        if (idx === ids.length - 1) {
                            if (curr.hasOwnProperty(module)) {
                                throw new Error(`Duplicate message id: ${id}`);
                            }

                            curr[module] = {
                                text: defaultMessage
                            };

                            return;
                        }

                        if (!curr.hasOwnProperty(module)) {
                            curr[module] = {};
                        }

                        curr = curr[module];
                    });
            });

            return collection;
        }, {});

fs.writeFileSync(
    `../../${ config.output.path }/i18n.json`,
    JSON.stringify({ en: defaultMessages }, null, 4)
);

