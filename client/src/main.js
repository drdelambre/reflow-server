import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

const MOUNT_NODE = document.getElementById('root');

let render = () => {
    const App = require('./index.js').default;

    ReactDOM.render(
        (
            <BrowserRouter>
                <App />
            </BrowserRouter>
        ),
        MOUNT_NODE
    );
};

if (__DEV__) {
    if (module.hot) {
        const renderApp = render,
            renderError = (error) => {
                const RedBox = require('redbox-react').default;

                ReactDOM.render(<RedBox error={ error } />, MOUNT_NODE);
            };

        render = () => {
            try {
                renderApp();
            } catch (e) {
                console.error(e);
                renderError(e);
            }
        };

        // Setup hot module replacement
        module.hot.accept([
            './index.js'
        ], () =>
            setImmediate(() => {
                ReactDOM.unmountComponentAtNode(MOUNT_NODE);
                render();
            })
        );
    }
}

if (!__TEST__) {
    render();
}
