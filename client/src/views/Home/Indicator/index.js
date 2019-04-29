import React from 'react';
import {
    grab,
    populate,
    watch
} from 'stores/toggle';
import { connect } from 'stores/socket';
import {
    grab as grabPrefix,
} from 'stores/prefix';

import style from './styles';

class Indicator extends React.Component {
    state = {
        active: false
    };

    constructor(props, ctx) {
        super(props, ctx);

        this.boundMsg = this.message.bind(this);
    }

    register() {
        grab()
            .then((status) => {
                this.setState({
                    active: status
                });
            });

        watch((status) => {
            this.setState({
                active: status
            });
        })
            .then((handle) => {
                this._watch = handle;
            });

        connect()
            .then((ws) => {
                ws.addEventListener('message', this.boundMsg);
            });
    }

    deregister() {
        if (this._watch) {
            this._watch.remove();
            delete this._watch;
        }

        connect()
            .then((ws) => {
                ws.removeEventListener('message', this.boundMsg);
            });
    }

    message(evt) {
        grabPrefix()
            .then((prefix) => {
                const _evt = JSON.parse(evt.data);

                if (_evt.prefix !== prefix) {
                    return;
                }

                if (_evt.evt !== 'temp_pid') {
                    return;
                }

                populate(_evt.data);
            });
    }

    componentDidMount() {
        this.register();
    }

    componentWillUnmount() {
        this.deregister();
    }

    render() {
        let klass = style.main;

        if (this.state.active) {
            klass = style.active;
        }

        return (
            <div className={ klass } />
        );
    }
}

export default Indicator;
